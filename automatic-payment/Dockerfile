FROM python:3.9.0b4-alpine3.12

COPY payscript /bin/payscript

COPY root /var/spool/cron/crontabs/root

RUN chmod +x /bin/payscript

CMD crond -l 2 -f