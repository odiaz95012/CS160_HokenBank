FROM python:3.9.0b4-alpine3.12

COPY interestscript /bin/interestscript

COPY root /var/spool/cron/crontabs/root

RUN chmod +x /bin/interestscript

CMD crond -l 2 -f