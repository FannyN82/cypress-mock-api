


describe ('Test with backend', () => {

  beforeEach ('Log in to the app', () => {
    cy.intercept('GET','https://api.realworld.io/api/tags', {fixture: 'tags.json'})
    cy.loginToApplication ()
  })

  it ('Verify correct request and respons', () => {

      cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

      cy.contains('New Article').click()
      cy.get('[formcontrolname="title"]').type('this is the title')
      cy.get('[formcontrolname="description"]').type('this is a description')
      cy.get('[formcontrolname="body"]').type('this is the body')
      cy.contains('Publish Article').click()

      cy.wait('@postArticles')
      cy.get('@postArticles').then( xhr => {
        console.log(xhr)
        expect(xhr.response.statusCode).to.equal(201)
        expect(xhr.request.body.article.body).to.equal('this is the body')
        expect(xhr.response.body.article.description).to.equal('this is a description')
      })
  })

  it ('verify popular tags are displays', () => {
      cy.get('.tag-list').should('contain','Cypress').and('contain', 'Automation').and('contain', 'Test')
  })

  it.only ('verify global feed likes count', () => {
      cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
      cy.intercept('GET', 'https://api.realworld.io/api/articles*',{fixture: 'articles.json'} )

      cy.contains('Global Feed').click()
      cy.get('app-article-list button').then(heartList => {
          expect(heartList[0]).to.contain('1')
          expect(heartList[1]).to.contain('5')
      })

      cy.fixture('articles').then (file => {
        const articleLink = file.articles[1].slug
        file.articles[1].favoritesCount = 6
        cy.intercept('POST', 'https://api.realworld.io/api/articles/'+ articleLink +'/favorite', file)
      })
      cy.get('app-article-list button').eq(1).click()
      cy.get('app-article-list button').eq(1).should('contain', '6')
  })
  })

