FROM ghcr.io/thingsdb/node:latest

FROM amd64/alpine:latest
RUN apk update && \
    apk add pcre2 libuv yajl curl tzdata openssl
RUN mkdir -p /var/lib/thingsdb

COPY --from=0 /usr/local/bin/thingsdb /usr/local/bin/

RUN mkdir /certificates && \
    cd /certificates && \
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes -subj "/CN=localhost"

# Volume mounts
VOLUME ["/data"]
VOLUME ["/modules"]
VOLUME ["/certificates"]

# Client (WSS) connections
EXPOSE 9270
# Status (HTTP) connections
EXPOSE 9002

ENV THINGSDB_WS_CERT_FILE=/certificates/cert.pem
ENV THINGSDB_WS_KEY_FILE=/certificates/key.pem

ENV THINGSDB_BIND_CLIENT_ADDR=0.0.0.0
ENV THINGSDB_BIND_NODE_ADDR=0.0.0.0
ENV THINGSDB_WS_PORT=9270
ENV THINGSDB_HTTP_STATUS_PORT=9002
ENV THINGSDB_MODULES_PATH=/modules
ENV THINGSDB_STORAGE_PATH=/data

ENTRYPOINT ["sh", "-c", "/usr/local/bin/thingsdb --init"]
