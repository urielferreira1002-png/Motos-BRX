# Publicacao no GitHub Pages (Motos BRX)

## 1) Estrutura pronta para Pages
- Home: `index.html`
- Fallback: `404.html`
- Sem Jekyll: `.nojekyll`
- Links internos: relativos (`index.html`, `motos/*.html`, `imgs/*`)

## 2) Publicar no GitHub
1. Suba todos os arquivos para um repositorio no GitHub.
2. No repositorio, abra `Settings` > `Pages`.
3. Em `Build and deployment`, escolha:
   - Source: `Deploy from a branch`
   - Branch: `main` (ou `master`), pasta `/ (root)`
4. Salve e aguarde o link final do site.

## 3) Configurar Firebase Auth para o dominio do GitHub
No Firebase Console (projeto `motos-brx`):
1. Authentication > Sign-in method > Google: habilitado.
2. Authentication > Settings > Authorized domains:
   - adicione `SEU_USUARIO.github.io`
   - se for projeto de repositorio (`/nome-repo`), mantenha o mesmo dominio `SEU_USUARIO.github.io`
3. Project settings > General > Your apps:
   - confirme que os dados de `auth-config.js` estao corretos.

## 4) Teste final
- Abra a URL publicada do Pages.
- Verifique:
  - redirecionamento para `login.html` quando nao autenticado
  - login Google funcionando
  - catalogo carregando cards
  - paginas `motos/*.html` abrindo com imagens locais

## Observacao
Se o login Google falhar em producao, quase sempre e dominio nao autorizado no Firebase.
