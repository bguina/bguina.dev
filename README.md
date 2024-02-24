# bguina.dev

Example NodeJS + Express personal website.

## Setup

- Pull the project dependencies (requires [Yarn](https://yarnpkg.com/getting-started/install)):
```bash
$ yarn install
```
- Start the server, made available at http://localhost:8080:
```bash
$ yarn start
```
Alternatively, using the deploy.nginx docker image:
```bash
$ docker-compose -f deploy/nginx/compose.local.yaml up -d --build --force-recreate
```

## Deploy

- Customize the ["deploy" workflow](.github/workflows/deploy.yml) and the [deploy script](deploy/deploy.sh),
- From [settings/secrets/actions](https://github.com/bguina/bguina.dev/settings/secrets/actions), set 
SSH_USERNAME, SSH_PORT, SSH_PRIVATE_KEY,
- Trigger the workflow manually from GitHub.
