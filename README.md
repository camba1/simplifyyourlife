# Node with MySQL

Simple Nodejs server connecting to MySQL and with hooks to Docker Jenkins and Kubernetes running in Minikube.

## About this project
This project was initially created for a demo. If you see something that could be improved either in the code or this document please feel free to open a pull request.

All my code in this repo is under MIT license, so feel free to use as needed. For external libraries and images used in this repo, please refer to their own licensing terms.

## Pre-requisites
In order to run the project in its entirety, you will need to have :

- A git account (I used [Bitbucket](http://bitbucket.org))
- A docker repository (I used [Docker hub](hub.docker.com))
- [Docker](docker.com) installed in your machine ( I used Docker Desktop on my Mac)
- [Minikube](https://minikube.sigs.k8s.io) installed in your machine

Also, this document refers to the image in docker hub as _bolbeck/simplenodemysql_. You should change this to your own image name so that it can run under your own docker hub account (otherwise you will not be able to push the image out).

## The Application

The app has two parts:

- **MySQL database**: based on the official MySQL image. The DB is initialized to have a test DB and a Test table with some sample dummy data. The initialization is used with the script in the mySqlInit directory. This is run only once and only if the data volume (./mySqlDB) is empty


- **Nodejs**: app which is built from the ```Dockerfile``` in the nodeApp directory. The app has two entry points:
    - **Root** ("/") just pulls writes hello world and the hostname
    - **/mysql** pull data from the test DB in MYSql and posts the JSON on the browser

Note that the application sends back pre-rendered page back to the client and uses _pug_ as the rendering engine.

### Bringing the application up

#### Using the Dockerfile

To bring up just the nodejs app:

- Go to the ./nodeApp directory
- Build the app: ``` docker build -t nodewithmysql_nodemysql . ```
- Run the container: ``` docker run -p 3000:3000 --name nodemysqlcont nodewithmysql_nodemysql ```
- Open ``` localhost:3000 ``` in your browser

Note that this will bring up only the nodejs application and not the DB, so the app will fail if you try to access the second page (```localhost:3000/mysql```)

#### Using docker-compose

##### Creating the node_modules folder

If this is the **first time** you will try to bring up the application, you will need to create the ```node_modules``` folder since that is not checked into source control.

If you have npm installed in your machine:

``` bash
cd ./nodeApp
npm install
```

If you do not have npm installed in your machine, from the root folder of our repo (where we have the docker-compose file):

``` bash
docker-compose run --rm  nodemysql bash
npm install
exit
```
The above commands will:

- Start the nodemysql service defined in our docker-compose file and log you  into the console in the container
- In the container, run npm install, which creates the node_modules folder in the container. Since we have a volume mounted in our container to the nodeApp folder in our machine (as defined in our dockercompose file), the node_modules folder gets created in our host machine as well and is ready for use.
- Exit the container and return to our host machine

##### Bring the application up

Use ```docker-compose up``` in the same directory where you have the docker-compose file to bring the application up . It uses a ```docker-compose.env``` file to pass the environment variables to the mysql service (better than keeping them in the docker-compose.yaml file).


### Running the Tests

- With the application running, login to the container with:

  `docker exec -it nodemysqlcont 'bash'`

- Run `npm test`
- To exit the container just use `exit`.

The application test scripts were created using _mocha_ and _chai_.

Also, use ```npm run test-exp``` to run some tests and export the results to a file in a format that Jenkins can understand. In this last case, the results will be saved to the _./test/results/test-results.xml_ file

### Restarting the nodejs container during development

During development, you may want ot restart the nodejs container. You can do this with: ```docker restart nodemysqlcont```

Alternatively you can install something like nodemon in your image to monitor for changes in the file system.

### Bring application down

Use ```docker-compose down``` in the same directory where you have the docker-compose file to bring the application down.

## Tag and push image manually

To push this the node image to dockerhub, we will first need to tag it properly, based in the dockerhub account id. we can also give it a proper tag so that we can keep a history.

- login to dockerhub, tag image and push to docker hub:

```bash
docker login --username <dockerUserId>
docker tag nodewithmysql_nodemysql bolbeck/simplenodemysql
docker push bolbeck/simplenodemysql:latest
```

**Note** that you will need to change the name of the image to match your own docker hub account

### Pushing to Minikube

#### K8s Manifests

Create the K8s manifests using Kompose. Note, we create a new directory for neatness, but this is not necessary strictly speaking

Kompose out of the box may not create exactly what you need, but gets you 80% - 90% there. The final modified files are in the Kubernetes folder already, but you could recreate the original output from Kompose using:

``` bash
mkdir KubernetesOrig
cd KubernetesOrig
kompose --file docker-compose.yml convert
```

#### Push to Minikube

For individual manifests execute

```kubectl apply -f <path/filename.yaml>```

For all the manifests at once:

```kubectl apply -f <Foldername>```

Similarly to delete resources created by the manifests:

```kubectl delete -f <path/filename.yaml>```
or
```kubectl delete -f <Foldername>```

To see how the resources spin or down, use the dashboard
```minikube dashboard```

To find the url where the application is running:
```minikube service list```

### Automating with Jenkins

Application uses a pipeline created using the Jenkinsfile in the application root directory. This file tells Jenkins what it needs to do. The steps required are basically:

Pull latest version from Bitbucket -> Build image -> Start container and run tests -> Deploy to Minikube

Note that since the Jenkins image does not come pre-installed with Kubectl, we build a custom image that has both Jenkins and Kubectl in the same image. The required Dockerfile can be found in the _jenkinsWithK8s_ directory.

#### Setup authentication to minikube

In order to authenticate to minikube, we need to copy some certificates from our local machine to our custom Jenkins image.  For obvious reasons, these certificates are not checked in to source control. Here is what needs to be done to set them up:

- In the _jenkinsWithK8s_ directory, create two directories **kubeconfig** and **minikConfig**
- Copy the contents from your machine's **~/.kube** directory to the newly created **kubeconfig** directory (note that the path for the .kube directory given here is for a mac, it may be different in other OS)
- Copy the following certificates from your machine's **~/.minikube** directory to the newly created **minikConfig** directory (note that the path for the .minikube directory given here is for a mac, it may be different in other OS):
    - client.crt
    - client.key
    - ca.crt

Once the certificates are in these directories, the image will pick them up automatically

From within the _jenkinsWithK8s_ folder:

``` bash
  mkdir kubeconfig
  mkdir minikConfig
  cp -r ~/.kube/* kubeconfig/
  cp ~/.minikube/client.crt minikConf
  cp ~/.minikube/client.key minikConf
  cp ~/.minikube/ca.crt minikConfig
```

#### Running the Jenkins image

 To run the Jenkins image:

``` bash
 cd ./jenkinsWithK8s
 docker build -t jenk .

 docker run -u root --rm -d -p 8080:8080 -p 50000:50000 --name jenkcont -v jenkins-data:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenk
```

#### Initializing Jenkins for first time run

 After the image is running:

–	Login on the web browser at ```localhost:8080```
–	Get the initial admin pwd :

``` bash
docker exec -it jenkcont 'bash'
cd /var/jenkins_home/secrets/
cat initialAdminPassword
```

- Paste the admin password in the Jenkins UI at localhost:8080
- Install required plugins (the defaults should be fine)
- Create a new user

#### Setup a pipeline to run our jobs

 - Add credentials for Bitbucket and Docker Hub in the credentials section in Jenkins
 - Create a new pipeline job that gets source code from the source control manager (SMC) and uses our Jenkins file.
   - Description
   - Build trigger (for our demo, we just scheduled to run every 10 mins)
   - Pipeline from scm
   - Location of the repo (bitbucket url)
   - Credentials to bitbucket if using a private repository
   - Location of the Jenkins file. In our project the jenkins file is in the root, so you can just enter jenkinsfile without a path.

# Have fun!
