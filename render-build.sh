npm install
npm run build

mkdir -p .next/standalone/.next

cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/