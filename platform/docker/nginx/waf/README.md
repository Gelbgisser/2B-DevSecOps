# WAF integration placeholders (Day 7).
#
# Application authorization MUST NOT depend on a WAF.
# Enable the Compose profile `waf` to load ModSecurity + OWASP CRS.
#
#   load_module modules/ngx_http_modsecurity_module.so;
#   modsecurity on;
#   modsecurity_rules_file /etc/nginx/waf/modsecurity.conf;
