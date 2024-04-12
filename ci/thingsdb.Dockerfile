FROM ghcr.io/thingsdb/node:latest

# Expose port (can be customized)
EXPOSE 9200
EXPOSE 7681
EXPOSE 9001

ENV THINGSDB_BIND_CLIENT_ADDR=0.0.0.0
ENV THINGSDB_BIND_NODE_ADDR=0.0.0.0
ENV THINGSDB_LISTEN_CLIENT_PORT=9200
ENV THINGSDB_HTTP_STATUS_PORT=9001
ENV THINGSDB_WS_PORT=7681

# Entrypoint
ENTRYPOINT ["sh", "-c", "/usr/local/bin/thingsdb --init" ]

# docker build -t thingsdb_ws  . -f ci/thingsdb.Dockerfile
# docker run --name ThingsDB_ws -d -p 9200:9200 -p 9001:9001 -p 7681:7681 thingsdb_ws
