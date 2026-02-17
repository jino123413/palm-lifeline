# GitHub Pages Hosting

Azure 인증 이슈가 있을 때 가장 간단한 대안은 GitHub Pages입니다.

## 배포 방식

- GitHub Actions가 `npm run build` 실행
- `dist/web`를 Pages로 자동 배포
- 워크플로우 파일: `.github/workflows/deploy-pages.yml`

## 예상 URL

- https://jino123413.github.io/palm-lifeline/

## 참고

- 리포지토리 하위 경로에서 정적 리소스가 깨지지 않도록 `rsbuild.config.ts`에 `assetPrefix: './'`를 설정했습니다.
- 첫 배포 후 `Settings > Pages`에서 Build and deployment가 `GitHub Actions`인지 확인하세요.
