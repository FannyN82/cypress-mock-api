

describe ('Test log out', () => {

  beforeEach ('log in to the app', () => {
    cy.loginToApplication()
  })

  it ('veridy user can log out succefully', () => {
      cy.contains('Settings').click()
      cy.contains('Or click here to logout').click()
      cy.get('.navbar-nav').should('contain', 'Sign up')
  } )
})
