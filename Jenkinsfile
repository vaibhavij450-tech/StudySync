pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'StudySync CI/CD pipeline started'
                checkout scm
            }
        }

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
    }

    post {
        success {
            echo 'StudySync pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the Console Output.'
        }
    }
}
