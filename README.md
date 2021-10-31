# syllabits

## Project setup
To install all dependencies:
```
npm install
```
* There are some additional assets that need to be downloaded manually because of licensing issues. Namely:
1. The 'Dovestype' font must be present in the src/styles/fonts folder.

### Building
```
npm run build
```
* You may need to generate the GraphQL schema before you can build the app. To do this, use:
```
npm run apollo:schema:generate
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Lints and fixes files
```
npm run lint
```

### 'Dummy' Backend
The app contains a 'dummy' backend which can be ran in lieu of running the actual backend. To run it, use
```
npm run apollo
```

### Deploying on CPanel
These are the recommended steps for deploying on CPanel:
1. Clone this repository on the CPanel system, and ensure that you are able to push to it.
2. Set up a build environment in the cloned repository. This involves installing dependencies, generating GraphQL schema, and downloading any licensed assets.
    * If the CPanel system is running an incompatible version of node, you can set up a node virtual environment in the new repository, using a tool like nodeenv. This project is built on Node 14.17.4.
3. Configure the repository to automatically build and deploy the app when a push is received. This can be accomplished using a .cpanel.yml file.
    * You might need to configure the repository to accept pushes to the current branch: this can be accomplished using
    ```
    git config git config receive.denyCurrentBranch updateInstead
    ```
    * CPanel can be a pain in the ass; the auto-deploy feature feels almost unusable. An alternative is to use a post-receive Git hook.
    * Another note: The 'yorkie' package made using "updateInstead" painful. It overrides all hooks in a way that breaks updateInstead. Considering the package hasn't been updated in 3 years, I should probably remove it.
    * Actually deploying the built app simply involves copying all files from dist/ to the public_html folder.
4. Simply push to the remote repository to deploy changes