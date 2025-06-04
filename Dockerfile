# bun
FROM oven/bun:slim

WORKDIR /next

# git & node & curl
RUN apt-get update && \
    apt-get install -y git curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

VOLUME ./next

CMD ["/bin/bash"]
