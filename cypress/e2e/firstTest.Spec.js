


describe ('Test with backend', () => {

  beforeEach ('Log in to the app', () => {
    //cy.intercept('GET','**/tags', {fixture: 'tags.json'}) - lyssnar på url:en
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'}) //lyssnar på path som är en del av url:en
    cy.loginToApplication ()
  })

  //https://api.realworld.io/api/tags

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

  it('Intercepting and modifying the request and respons', () => {

    // cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) =>{
    //     req.body.article.description = "This is description 2"
    // }).as('postArticles')

    cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) =>{
      req.reply ( res=> {
        expect(res.body.article.description).to.equal('this is a description')
        res.body.article.description = "This is description 2"
      })
  }).as('postArticles')

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
      expect(xhr.response.body.article.description).to.equal('This is description 2')
    })
})


  it('verify popular tags are displays', () => {
      cy.get('.tag-list').should('contain','Cypress').and('contain', 'Automation').and('contain', 'Test')
  })

  it('verify global feed likes count', () => {
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

  it('Delete a new article in global feed', () => {

      // const userCredentials = {
      //   "user": {
      //       "email": "fanny.nilsson@fdab.se",
      //       "password": "CypressTest1"
      //   }


      const bodyRequest = {
        "article": {
            "title": "Testing requests",
            "description": "Testing API request",
            "body": "We are testing to request API's",
            "tagList": []
        }
    }

      cy.get('@token').then( token => {

        cy.request ({
          url: 'https://api.realworld.io/api/articles/',
          headers: {'Authorization': 'Token '+token},
          method: 'POST',
          body:bodyRequest,
        }).then(response => {
          expect(response.status).to.equal(201)
        })

        cy.contains('Global Feed').click()
        cy.contains('Testing requests').click()
        cy.get('.article-actions').contains('Delete Article ').click()

        cy.request({
          url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
          headers: {'Authorization': 'Token '+token},
          method: 'GET',
        }).its('body').then (body => {
          expect(body.articles[0].title).not.to.equal('Testing requests')
        })
      })


  })

})

