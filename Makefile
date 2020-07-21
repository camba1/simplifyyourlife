jenkcontup:
	docker run -u root --rm -d -p 8080:8080 -p 50000:50000 --name jenkcont -v jenkins-data:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock jenk
	
