# FamilyFlow

Aile içi görev ve iletişim uygulaması. React Native + Expo ile geliştirildi.

## Ne işe yarıyor?

- Alışveriş, fatura, plan gibi görevleri takip et
- Aile üyeleriyle sohbet et
- Görev tamamlandığında otomatik bildirim gider
- Davet sistemiyle aile üyesi ekle
- Her ailenin verileri birbirinden ayrı (Firebase ile izole)

## Teknolojiler

- React Native + Expo
- TypeScript
- Firebase (Auth + Firestore)
- Google Sign-In
- Zustand (state yönetimi)

## Kurulum

```bash
npm install
npx expo start
```

## Build

```bash
npx eas-cli build -p android --profile preview
```
