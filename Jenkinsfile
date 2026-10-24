
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Verify Project Files') {
            steps {
                sh 'test -f Dockerfile'
                sh 'test -f docker-compose.yml'
                sh 'test -f backend/Dockerfile'
                sh 'test -f backend/tests/health.test.js'
                echo 'All required project files found'
            }
        }

        stage('Frontend Quality Checks') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
                sh 'npm run build'
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t studysync-frontend:latest .'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t studysync-backend:latest .'
                }
            }
        }

        stage('Deploy StudySync') {
            steps {
                sh '''
                    docker-compose -f docker-compose.yml down --remove-orphans || true
                    docker rm -f studysync-backend studysync-frontend || true

                    STUDYSYNC_ENV_FILE=/run/secrets/studysync-backend.env \
                    docker-compose -f docker-compose.yml up -d --no-build --force-recreate
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    test "$(docker inspect -f '{{.State.Running}}' studysync-frontend)" = "true"
                    test "$(docker inspect -f '{{.State.Running}}' studysync-backend)" = "true"
                    echo "Both StudySync containers are running"
                '''
            }
        }
    }

    post {
        success {
            echo 'StudySync CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
