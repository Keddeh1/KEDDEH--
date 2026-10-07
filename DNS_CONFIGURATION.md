# DNS Configuration for KEDDEH GRID

The following records are required for proper operation, mail delivery, and domain verification.

| Type | Name | Data | TTL |
| :--- | :--- | :--- | :--- |
| CNAME | www | custom-domains.chatgpt.site | 30 mins |
| MX | @ | smtp.google.com (Priority 1) | 1 hr |
| TXT | @ | v=spf1 include:_spf.google.com ~all | 1 hr |
| TXT | _cf-custom-hostname.www | 54251cf2-25f1-446c-aa5b-4a866ba5cc20 | 30 mins |
| TXT | _openai-site-verification.www | openai-site-verification=YsG8QdITvo_l73_mbqBZ3k-lJXe6GXmNatuK-Bvk2B4 | 30 mins |
| TXT | google._domainkey | v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxpLunYFFcvLv4w9E3weGwqzckQoi80kAYNO82iyO4qy/1WOyxpxrMrg9Fe6nxGcCa3KUQephJa88ypF/9VO8/WwmbkFLEBlMvY0ok0EiAT5FqFD2h1Fq66HByJZy4sIMeq/A8BnrADil8wH0l3AlY2Yhh9WuFc92kFXO5xUxsFVoR/a3LKE+QSMjz7vowuw16V4G3wU7u/6o1INPa1INMomQ+lP+Olk3+6fppl+Re26OR4JPI0xckPRXgkjhpW9Ode5gLUC2aoD3/xJcJTKKZ24hs/5DsYH9zInzjzQHfdFLyB8b+aevmT3NtmfIypcJwI8joKiIOzvlzPUIIuSSlwIDAQAB | 1 hr |
