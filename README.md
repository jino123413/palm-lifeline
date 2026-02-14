# 손금 수명 미리보기

손바닥 사진을 촬영해 생기/안정/회복/집중 흐름을 로컬 규칙 엔진으로 리딩하는 Apps in Toss WebView 미니앱입니다.

## 핵심 기능

- 카메라 권한 게이트: `openCamera.getPermission()` + `openPermissionDialog()`
- 손금 촬영: `openCamera({ base64: true, maxWidth: 1280 })`
- 로컬 리딩 엔진: 촬영 데이터 기반 deterministic 점수 계산
- 3단계 플로우: Home -> Capture -> Result
- 공유: `getTossShareLink` + `share`

## 권한 설정

`granite.config.ts`에 아래 권한이 필요합니다.

```ts
permissions: [
  {
    name: 'camera',
    access: 'access',
  },
];
```

## 실행

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 문서

- 레이아웃 구조: `docs/layout-structure.md`
- QA 워크플로우 체크리스트: `docs/qa-workflow-checklist.md`

