# Node with MySQL

Simple Nodejs server connecting to MySQL and with hooks to Jenkins and Kubernetes.

### Bringing the application up

Just use ```docker-compose up``` to bring the application up. It uses a ```docker-compose.env``` file to pass the environment variables to docker-compose (better than keeping then in the docker-compose.yaml file, but still sub-optimal).
The app has two parts:
- **MySQL database**: based on the official MySQL image. The DB is initialized to have a test DB and a Test table with some sample dummy data. The initialization is used with the script in the mySqlInit directory. This is run only once and only if the data volume (./mySqlDB) is empty
- **Node js**: app which is built from the ```Dockerfile``` in the src directory. The app has two entry points:
  - **Root** ("/") just pulls writes hello world and the hostname
  - **/mysql** pull data from the test DB in MYSql and posts the JSON on the browser

Note that the application sends back pre-rendered page back to the client and uses _pug_ as the rendering engine.

### Running the Tests
You can login to the container with :`docker exec -it nodemysqlcont 'bash'` and then just run `npm test`. To exit the container just use `exit`. If you have an error and you change the code, you can restart the container `docker restart nodemysqlcont`  (or just can install something like nodemon to check for changes in the file system).

The application test scripts were created using _mocha_ and _chai_.

Also, use ```npm test-exp``` to run some tests and export the results to a file in a format that Jenkins can understand. In this last case, the results will be save to the _./test/results/test-results.xml_ file

## Tag and Push image
To push this the node image to dockerhub, we will first need to tag it properly, based in the dockerhub account id. we can also give it a proper tag so that we can keep a history.

- login to dockerhub, tag image and push to docker hub example:

```bash
docker login --username <dockerUserId>
docker tag nodewithmysql_nodemysql bolbeck/simplenodemysql
docker push bolbeck/simplenodemysql:latest
```

### Pushing to Minikube

#### K8s Manifests
Create the K8s manifests using Kompose. Note, we create a new directory for neatness, but this is not necessary strictly speaking

``` bash
mkdir Kubernetes
cd Kubernetes
kompose --file docker-compose.yml convert
```

Kompose out of the box may not create exactly what you need, nut gets you 90% there. The final files are in the Kubernetes folder.

#### Push to Minikube

For individual manifests do

```kubectl apply -f <path/filename.yaml>```

For all the manifests at once:

```kubectl apply -f <Foldername>```

Similarly to delete resources created by the manifests:

```kubectl delet -f <path/filename.yaml>```
or
```kubectl delete -f <Foldername>```

To see how the resources spin or down, use the dashboard
```minikube dashboard```

To find the url where the application is running:
```minikube service list```

### Automating with Jenkins

Application uses a pipeline created using the Jenkinsfile in the root directory which tells Jenkins what is needs to do :

Pull latest version from Bitbucket -> Build image -> Start container and run tests -> Deploy to Kubernetes

Note that since the Jenkins image does not come pre-installed with Kubectl, we build a custom image which can be found in the jenkinsWithK8s directory which installs it and configures it automatically (assuming that we are deploying to Minikube in the host machine).
 To run the Jenkins image:

 ```bash
 docker build -t jenk .

 docker run -u root --rm -d -p 8080:8080 -p 50000:50000 --name jenkcont -v jenkins-data:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenk
 ```

 After the image is running:
 - Add credentials for Bitbucket and Docker Hub in the credentials section in Jenkins
 - Create a new pipeline job that gets source code from the source control manager (SMC) and uses our Jenkins file.
