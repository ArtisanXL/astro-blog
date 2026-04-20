---
title: "Bir akşamda D1 üzerinde failed_jobs view'ı kurdum"
description: "Queue yazısı el-yapımı observability ile bitiyordu. Bu, o build. Bir D1 tablosu, bir DLQ consumer, bir HTML view, 150 satır altında."
pubDate: 2026-04-20
tags: ["cloudflare", "queue", "veritabani", "edge"]
translationKey: "failed-jobs-on-d1"
---

Bir önceki yazıda Cloudflare Queues'tan bahsetmiş ve "Cloudflare'in vermediği şeyi el ile yaptım" diye bitirmiştim. Bu, o build. Bir akşam, üç dosya.

Laravel queues'tan Cloudflare Queues'a geçerken kaybettiğim şey `failed_jobs` tablosuydu. Laravel'de retry'ları biten her job otomatik o tabloya düşer: payload, exception, stack trace, failed-at timestamp. Normal tablo gibi sorgularsın, retry'larsın, ondan öğrenirsin. Cloudflare Queues'un dead-letter queue'su var. DLQ'dan consume edebilirsin ama failure'ın ne olduğuna dair built-in kayıt yok. Message body geliyor, retry'ları bitiren exception gelmiyor.

Üç şey istiyordum. SQL ile sorgulayabildiğim kalıcı bir tablo. Her queue için yeniden yazmam gerekmeyen, DLQ message'larını tabloya çeken bir consumer. `/_admin/failed`'da yükleyebileceğim minimal bir HTML view. Süslü değil. Horizon şeklinde, Horizon ölçeğinde değil.

Schema küçük. SQLite'ta her INSERT bütün satırı kopyalıyor, replica varsa o satırı bir de network'ten geçiriyorsun. O yüzden kolonları sadece baktıklarımla sınırladım:

```sql
CREATE TABLE failed_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue TEXT NOT NULL,
  message_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  error TEXT,
  attempts INTEGER NOT NULL,
  failed_at INTEGER NOT NULL,
  CHECK (length(payload) < 65536)
);

CREATE INDEX failed_jobs_failed_at ON failed_jobs (failed_at DESC);
CREATE INDEX failed_jobs_queue ON failed_jobs (queue);
```

`failed_at` unix saniyesi. D1'in uğraşmaya değer native bir timestamp tipi yok, sıralama için integer zaten istediğin şey. Payload length CHECK'i orada çünkü tabloyu yanlışlıkla queue'ya itilmiş 5MB'lık bir JSON blob ile doldurmaktansa write'ın gürültülü başarısız olmasını tercih ederim.

DLQ consumer tek dosya:

```ts
export default {
  async queue(batch: MessageBatch<unknown>, env: Env) {
    for (const message of batch.messages) {
      try {
        await env.DB.prepare(
          "INSERT INTO failed_jobs (queue, message_id, payload, error, attempts, failed_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
          .bind(
            batch.queue,
            message.id,
            JSON.stringify(message.body).slice(0, 65535),
            (message as any).error ?? null,
            message.attempts,
            Math.floor(Date.now() / 1000)
          )
          .run();
        message.ack();
      } catch (e) {
        console.error("failed to record failed job", e);
        message.retry();
      }
    }
  },
};
```

DLQ message'ında retry'ları bitiren gerçek exception güvenilir değil. Onu original consumer'larda handler'ı wrap edip son hatayı message body'ye koyarak çözüyorum. Çirkin ama işliyor.

HTML view sürekli değiştirdiğim parça. İlk versiyonu JSON'du, bir bakıştan sonra vazgeçtim. Şimdiki versiyon Worker route'undan server-rendered HTML. `failed_at` üzerinden cursor-based pagination, queue, message_id, error'un ilk satırı, payload'ı genişletme link'i. Yaklaşık 80 satır HTML-in-template ve bir D1 query.

Auth tarafı Cloudflare Access. Access için ödemiyorsanız uzun random değerli paylaşılan bir header personal-blog ciddiyeti için yetiyor.

Horizon'a göre kaçırdığım şey: UI'dan retry. Bende SQL update ya da küçük bir CLI script. Henüz button yapmadım çünkü bende başarısızlıklar ya "kodu düzelt, sonraki deneme tutar" ya da "payload yanlıştı, sil ve geç" oluyor. İkisi de button istemiyor.

Pattern, genelleştirilmiş hali: platform sana istediğin observability şeklini vermiyorsa ve veri hacmi küçükse, en ucuz cevap genelde bir tablo ve bir Worker. SaaS observability faturasından bir yıl uzak durmak, karşılığında bir akşam yazmak. Sıradaki boşlukta matematiği yapmaya değer. Neyse.
