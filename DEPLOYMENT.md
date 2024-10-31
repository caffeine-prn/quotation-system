# 배포 가이드

## 1. 시스템 아키텍처

```plaintext
[Client Browser] → [CloudFlare] → [Frontend (Vercel)] → [Backend API (ECS)] → [RDS]
                                                                           → [S3 (파일 저장)]
```

## 2. 배포 환경 구성

### 2.1 개발 환경
```bash
# 로컬 개발 환경 실행
docker-compose up
```

### 2.2 스테이징 환경
- 브랜치: staging
- URL: staging.quotation-system.com

### 2.3 프로덕션 환경
- 브랜치: main
- URL: quotation-system.com

## 3. 인프라 구성 (AWS 기준)

### 3.1 필요한 AWS 서비스
- ECS (Elastic Container Service)
- RDS (PostgreSQL)
- S3 (파일 저장)
- CloudWatch (로깅)
- Route 53 (도메인 관리)
- ACM (SSL 인증서)
- WAF (보안)

### 3.2 네트워크 구성
- VPC 설정
  - 프라이빗 서브넷: RDS, ECS
  - 퍼블릭 서브넷: ALB, NAT Gateway
- 보안 그룹 설정

## 4. 배포 절차

### 4.1 프론트엔드 배포 (Vercel)
1. GitHub 저장소와 Vercel 연동
2. 환경 변수 설정:
   ```
   REACT_APP_API_URL=https://api.quotation-system.com
   REACT_APP_ENVIRONMENT=production
   ```
3. 빌드 설정:
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ]
   }
   ```

### 4.2 백엔드 배포 (AWS ECS)

1. ECR 레포지토리 생성 및 이미지 푸시
```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드
docker build -t quotation-api ./backend

# 태그 설정
docker tag quotation-api:latest $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/quotation-api:latest

# 이미지 푸시
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/quotation-api:latest
```

2. ECS 서비스 설정
- Task Definition 생성
- 서비스 생성 (Blue/Green 배포)
- Auto Scaling 설정

### 4.3 데이터베이스 설정 (RDS)
```sql
-- 데이터베이스 생성
CREATE DATABASE quotation_system;

-- 사용자 생성
CREATE USER quotation_user WITH PASSWORD 'your_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE quotation_system TO quotation_user;
```

## 5. CI/CD 파이프라인

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main, staging ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      # 백엔드 배포
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/quotation-api:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/quotation-api:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster quotation-cluster --service quotation-service --force-new-deployment

      # 프론트엔드는 Vercel이 자동으로 처리
```

## 6. 모니터링 및 로깅

### 6.1 CloudWatch 설정
- 로그 그룹 생성
- 메트릭 설정
- 알람 설정

### 6.2 알림 설정
- CloudWatch 알람 → SNS → Slack/Email

## 7. 백업 전략

### 7.1 데이터베이스 백업
- RDS 자동 백업 활성화
- 보관 기간: 7일
- 스냅샷 주기: 매일

### 7.2 파일 백업 (S3)
- 버저닝 활성화
- 수명 주기 정책 설정

## 8. 보안 설정

### 8.1 SSL/TLS
- ACM 인증서 발급
- ALB HTTPS 리스너 설정

### 8.2 WAF 규칙
- SQL Injection 방지
- XSS 방지
- Rate Limiting

## 9. 스케일링 전략

### 9.1 Auto Scaling 설정
- CPU 사용률 70% 이상: 스케일 아웃
- CPU 사용률 30% 이하: 스케일 인
- 최소 인스턴스: 2
- 최대 인스턴스: 10

### 9.2 RDS 스케일링
- 필요시 읽기 전용 복제본 추가

## 10. 비용 최적화

### 10.1 예상 비용 (월간)
- ECS: $100~200
- RDS: $50~100
- S3: $10~20
- 기타: $50~100
- 총계: $210~420

### 10.2 비용 절감 전략
- Reserved Instance 사용
- S3 Lifecycle 정책 설정
- Auto Scaling 최적화