# Use the latest Ubuntu image
FROM ubuntu:22.04

# Install build dependencies
RUN apt-get update && \
    apt-get install -y \
        libuv1-dev \
        libpcre2-dev \
        libyajl-dev \
        libcurl4-nss-dev \
        build-essential \
        git \
        libwebsockets-dev

# Switch to the lws branch
RUN git clone --branch lws https://github.com/thingsdb/ThingsDB.git ThingsDB

# Compile ThingsDB
WORKDIR ThingsDB/Release
RUN make clean && make

# Copy the executable
RUN cp thingsdb /usr/local/bin/thingsdb

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
