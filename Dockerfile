FROM node:8-alpine

ENV PORT 8080
EXPOSE 8080

ENV app /usr/src/app/

RUN apk update && apk add git && mkdir -p ${app} && chown node ${app}
WORKDIR ${app}

USER node
COPY package.json ${app}
RUN npm install
COPY . ${app}

CMD ["npm", "start"]
