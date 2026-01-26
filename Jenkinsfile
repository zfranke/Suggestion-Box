pipeline {
    agent { label 'docker-worker' }

    environment {
        DB_ROOT_PASSWORD = credentials('suggestion-db-root-password')
        DB_NAME          = credentials('suggestion-db-name')

        FRONTEND_URL = 'http://suggestions.zfserver.lan'
        BACKEND_URL  = 'http://suggestions-backend.zfserver.lan:5055'
    }

    stages {
        stage('Build Images') {
            steps {
                sh '''
                  docker build -t suggestion-box-db suggestion-box-db
                  docker build -t suggestion-box-backend suggestion-box-backend
                  docker build -t suggestion-box-frontend suggestion-box-frontend
                '''
            }
        }

        // Validate compose version
        stage('Validate which Docker Compose is installed') {
            steps {
                sh 'docker-compose version'
            }
        }   

        stage('Start Stack') {
            steps {
                sh 'docker compose -f docker-compose.ci.yml up -d'
            }
        }

        stage('Backend Health Check') {
            steps {
                sh '''
                 for i in {1..10}; do
                    docker exec suggestions-backend \
                      curl -sf ${BACKEND_URL}/health && exit 0
                    sleep 3
                  done

                  echo "Backend failed to become healthy"
                  docker logs suggestions-backend || true
                  exit 1
                '''
            }
        }

        stage('Frontend → Backend Connectivity') {
            steps {
                sh '''
                  docker exec suggestions-frontend \
                    curl -sf ${BACKEND_URL}/health
                '''
            }
        }
    }

    post {
        always {
            script {
                def response = input(
                    id: 'cleanupPrompt',
                    message: 'Delete Suggestion Box containers?',
                    ok: 'Proceed',
                    parameters: [
                        booleanParam(
                            defaultValue: true,
                            description: 'Delete containers after this run?',
                            name: 'DELETE_CONTAINERS'
                        )
                    ]
                )

                if (response) {
                    echo 'User chose to delete containers'
                    sh '''
                      docker compose down -v
                    '''
                } else {
                    echo 'Containers left running for inspection'
                    sh '''
                      docker ps --filter "name=suggestions"
                    '''
                }
            }
        }
    }
}
