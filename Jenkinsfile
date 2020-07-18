node {
    def app

    stage('Clone repository') {

        /* Clone our repository */
        checkout scm
    }

    stage('Build image') {
      dir('nodeApp') {

        /* Build the docker image */
        app = docker.build("bolbeck/dow2020simplelife")
      }
    }

    stage('Test image') {

        /* Start docker image and run tests */
        app.withRun{ c ->
          sh "docker exec  ${c.id} npm install"
          sh "docker exec  ${c.id} npm run test-exp"
          sh "mkdir -p nodeApp/test/results/"
          sh "docker cp ${c.id}:/code/test/results/test-results.xml nodeApp/test/results/test-results.xml"
        }
    }

    stage('Publish test results') {

      /*Save test results in Jenkins history */
        junit 'nodeApp/test/results/test-results.xml'
    }


    stage('Push image') {

        /* Push images: First is tagged with the build BUILD_NUMBER
         the second is just tagged latest !*/
        docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }

    stage('Deploy to K8s') {

      /* Apply all manifest files */
      sh "kubectl apply -f ./Kubernetes/"
    }

}
