# syllabits

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Lints and fixes files
```
npm run lint
```

### Deploying
The script 'deploy.ps1' builds the project and uploads the minified app to a server via sftp. The server connection info is contained in a 'deploy.cfg' file, which should contain the following fields:
1. username
2. password
3. host
4. port
5. remote_dir

### 'Dummy' Backend
The app contains a 'dummy' backend which can be ran in lieu of running the actual backend. To run it, use
```
npm run apollo
```