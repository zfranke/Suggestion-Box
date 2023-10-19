pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Checkout the code from GitHub
                git branch: 'main', credentialsId: 'github-creds-pat', url: 'https://github.com/zfranke/Suggestion-Box.git'
            }
        }

        stage('Build and Test Containers:') {
            steps {
                // Database
                dir(path: 'suggestion-box-db') {
                    script {
                        // Build the Docker image for the database
                        sh 'docker build -t suggestion-box-db .'
                        // Run the Docker container for the database
                        sh 'docker run -d --name suggestion-db suggestion-box-db'
                        // Perform a connectivity test for the database
                        sh 'docker exec -it suggestion-db ping suggestion-db'
                    }
                }

                // Backend
                dir(path: 'suggestion-box-backend') {
                    script {
                        // Build the Docker image for the backend
                        sh 'docker build -t suggestion-box-backend .'
                        // Run the Docker container for the backend
                        sh 'docker run -d --name suggestion-backend suggestion-box-backend'
                        // Perform a connectivity test for the backend
                        sh 'docker exec -it suggestion-backend ping suggestion-db'
                    }
                }

                // Frontend
                dir(path: 'suggestion-box-frontend') {
                    script {
                        // Build the Docker image for the frontend
                        sh 'docker build -t suggestion-box-frontend .'
                        // Run the Docker container for the frontend
                        sh 'docker run -d --name suggestion-frontend suggestion-box-frontend'
                        // Perform a connectivity test for the frontend
                        sh 'docker exec -it suggestion-frontend curl http://suggestion-backend:5055'
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up resources, send notifications, or perform other post-build actions
            sh 'docker stop suggestion-db suggestion-backend suggestion-frontend'
            sh 'docker rm suggestion-db suggestion-backend suggestion-frontend'
        }
    }
}


