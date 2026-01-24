pipeline {
    agent { label 'docker-worker' }

    environment {
        NETWORK = 'suggestion-box-ci'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds-pat',
                    url: 'https://github.com/zfranke/Suggestion-Box.git'
            }
        }

        stage('Create Docker Network') {
            steps {
                sh '''
                  docker network inspect $NETWORK >/dev/null 2>&1 || \
                  docker network create $NETWORK
                '''
            }
        }

        stage('Build Images') {
            steps {
                dir('suggestion-box-db') {
                    sh 'docker build -t suggestion-box-db .'
                }
                dir('suggestion-box-backend') {
                    sh 'docker build -t suggestion-box-backend .'
                }
                dir('suggestion-box-frontend') {
                    sh 'docker build -t suggestion-box-frontend .'
                }
            }
        }

        stage('Start Containers') {
            steps {
                sh '''
                  docker run -d --rm \
                    --name suggestion-db-test \
                    --network $NETWORK \
                    suggestion-box-db

                  docker run -d --rm \
                    --name suggestion-backend-test \
                    --network $NETWORK \
                    suggestion-box-backend

                  docker run -d --rm \
                    --name suggestion-frontend-test \
                    --network $NETWORK \
                    -p 5054:5054 \
                    suggestion-box-frontend
                '''
            }
        }

        stage('Backend Health Check') {
            steps {
                sh '''
                  echo "Waiting for backend..."
                  for i in {1..10}; do
                    docker exec suggestion-backend-test \
                      curl -sf http://suggestion-backend:5055/health && exit 0
                    sleep 3
                  done
                  echo "Backend failed to become healthy"
                  exit 1
                '''
            }
        }

        stage('Frontend → Backend Connectivity') {
            steps {
                sh '''
                  docker exec suggestion-frontend-test \
                    curl -sf http://suggestion-backend:5055
                '''
            }
        }
    }

    post {
        always {
            sh '''
              docker rm -f suggestion-db-test suggestion-backend-test suggestion-frontend-test || true
              docker network rm $NETWORK || true
            '''
        }
    }
}
