
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
                echo 'All required project files found'
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
                    STUDYSYNC_ENV_FILE=/run/secrets/studysync-backend.env \
                    docker-compose -f docker-compose.yml up -d --no-build --force-recreate
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker ps --filter name=studysync-frontend --filter status=running'
                sh 'docker ps --filter name=studysync-backend --filter status=running'
                echo 'Deployment verification completed'
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
