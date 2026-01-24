pipeline {
    agent { label 'docker-worker' }

    parameters {
        booleanParam(
            name: 'TEARDOWN_CONTAINERS',
            defaultValue: true,
            description: 'Remove CI containers after pipeline finishes'
        )
    }

    environment {
        NETWORK = 'suggestion-box-ci'

        DB_ROOT_PASSWORD = credentials('suggestion-db-root-password')
        DB_NAME          = credentials('suggestion-db-name')
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

        stage('Start CI Stack') {
            steps {
                sh 'docker-compose -f docker-compose.ci.yml up -d'
            }
        }

        stage('Backend Health Check') {
            steps {
                sh '''
                  for i in {1..10}; do
                    docker exec suggestions-backend \
                      curl -sf http://suggestions-backend:5055/health && exit 0
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
                    curl -sf http://suggestions-backend:5055/health
                '''
            }
        }
    }

    post {
        always {
            script {
                if (params.TEARDOWN_CONTAINERS) {
                    sh '''
                    docker rm -f \
                        suggestions-db \
                        suggestions-backend \
                        suggestions-frontend || true

                    docker network rm $NETWORK || true
                    '''
                } else {
                    echo "Leaving CI containers running (TEARDOWN_CONTAINERS=false)"
                }
            }
        }
    }

}
