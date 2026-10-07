export const KEDDEH_AUTHORITATIVE_DNS = [
  { type: 'CNAME', host: 'www', ttl: '30 mins', value: 'custom-domains.chatgpt.site' },
  { type: 'MX', host: '@', priority: 1, ttl: '1 hr', value: 'smtp.google.com' },
  { type: 'TXT', host: '@', ttl: '1 hr', value: 'v=spf1 include:_spf.google.com ~all' },
  { type: 'TXT', host: '_cf-custom-hostname.www', ttl: '30 mins', value: '54251cf2-25f1-446c-aa5b-4a866ba5cc20' },
  { type: 'TXT', host: '_openai-site-verification.www', ttl: '30 mins', value: 'openai-site-verification=YsG8QdITvo_l73_mbqBZ3k-lJXe6GXmNatuK-Bvk2B4' },
  { type: 'TXT', host: 'google._domainkey', ttl: '1 hr', value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxpLunYFFcvLv4w9E3weGwqzckQoi80kAYNO82iyO4qy/1WOyxpxrMrg9Fe6nxGcCa3KUQephJa88ypF/9VO8/WwmbkFLEBlMvY0ok0EiAT5FqFD2h1Fq66HByJZy4sIMeq/A8BnrADil8wH0l3AlY2Yhh9WuFc92kFXO5xUxsFVoR/a3LKE+QSMjz7vowuw16V4G3wU7u/6o1INPa1INMomQ+lP+Olk3+6fppl+Re26OR4JPI0xckPRXgkjhpW9Ode5gLUC2aoD3/xJcJTKKZ24hs/5DsYH9zInzjzQHfdFLyB8b+aevmT3NtmfIypcJwI8joKiIOzvlzPUIIuSSlwIDAQAB' }
];
