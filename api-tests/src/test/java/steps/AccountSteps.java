package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.*;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import io.restassured.http.ContentType;
import io.restassured.response.Response;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class AccountSteps {

    private final ScenarioContext ctx;

    public AccountSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    /**
     * Creates a CHEQUING account as a precondition and stores the account ID in the scenario context.
     * Asserts that the creation succeeds with a 201 response.
     */
    @Given("a chequing account exists for {string}")
    public void aChequingAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        assertThat(response.statusCode(), is(201));
        ctx.set("accountId", response.jsonPath().getString("id"));
    }

    /**
     * Creates a second CHEQUING account as a precondition and stores its ID under "secondAccountId".
     * Used in transfer scenarios that require two distinct accounts.
     */
    @Given("a second chequing account exists for {string}")
    public void aSecondChequingAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        assertThat(response.statusCode(), is(201));
        ctx.set("secondAccountId", response.jsonPath().getString("id"));
    }

    /**
     * Creates a SAVINGS account as a precondition and stores the account ID in the scenario context.
     * Asserts that the creation succeeds with a 201 response.
     */
    @Given("a savings account exists for {string}")
    public void aSavingsAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "SAVINGS");
        assertThat(response.statusCode(), is(201));
        ctx.set("accountId", response.jsonPath().getString("id"));
    }

    /**
     * Creates a CHEQUING account and immediately freezes it as a precondition.
     * Stores the account ID in the scenario context.
     * Throws PendingException if the freeze endpoint returns 404 (not yet implemented).
     */
    @Given("a frozen chequing account exists for {string}")
    public void aFrozenChequingAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        assertThat(response.statusCode(), is(201));
        String id = response.jsonPath().getString("id");
        ctx.set("accountId", id);

        Response freezeResponse = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId())
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET)
            .when()
                .patch(ApiConfig.ACCOUNTS_PATH + "/" + id + "/freeze")
            .then()
                .extract().response();

        if (freezeResponse.statusCode() == 404) {
            throw new io.cucumber.java.PendingException();
        }
    }

    /**
     * Sends a POST request to create a CHEQUING account and stores the result as the last response.
     * If creation succeeds, the new account ID is stored in the scenario context.
     */
    @When("a chequing account is created for {string}")
    public void aChequingAccountIsCreatedFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("accountId", response.jsonPath().getString("id"));
        }
    }

    /**
     * Sends a POST request to create a SAVINGS account and stores the result as the last response.
     * If creation succeeds, the new account ID is stored in the scenario context.
     */
    @When("a savings account is created for {string}")
    public void aSavingsAccountIsCreatedFor(String ownerName) {
        Response response = createAccount(ownerName, "SAVINGS");
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("accountId", response.jsonPath().getString("id"));
        }
    }

    @When("a {string} account is created for {string}")
    public void anArbitraryAccountIsCreatedFor(String accountType, String ownerName) {
        Response response = createAccount(ownerName, accountType);
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("accountId", response.jsonPath().getString("id"));
        }
    }

    /**
     * Sends a POST request to create an account with an empty ownerName field.
     * Used to verify that the API rejects missing owner names with a 400 error.
     */
    @When("an account is created with an empty owner name")
    public void anAccountIsCreatedWithAnEmptyOwnerName() {
        Map<String, String> body = new HashMap<>();
        body.put("ownerName", "");
        body.put("accountType", "CHEQUING");

        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH)
            .then()
                .extract().response();

        ctx.setLastResponse(response);
    }

    /**
     * Sends a GET request to fetch the account stored in the scenario context by its ID.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("the account is fetched by ID")
    public void theAccountIsFetchedById() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Sends a GET request to fetch an account by a literal ID string (e.g. a nonexistent ID).
     * Stores the response as the last response for subsequent assertions.
     */
    @When("account {string} is fetched")
    public void accountIsFetched(String id) {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Sends a GET request to list all accounts (GET /api/accounts).
     * Stores the response as the last response for subsequent assertions.
     */
    @When("all accounts are listed")
    public void allAccountsAreListed() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.ACCOUNTS_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Sends a PATCH request to freeze the account stored in the scenario context.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("the account is frozen")
    public void theAccountIsFrozen() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .patch(ApiConfig.ACCOUNTS_PATH + "/" + id + "/freeze")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Sends a PATCH request to unfreeze the account stored in the scenario context.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("the account is unfrozen")
    public void theAccountIsUnfrozen() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .patch(ApiConfig.ACCOUNTS_PATH + "/" + id + "/unfreeze")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the account nickname is updated to {string}")
    public void theAccountNicknameIsUpdatedTo(String nickname) {
        String id = ctx.getString("accountId");
        Map<String, String> body = new HashMap<>();
        body.put("nickname", nickname);

        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .patch(ApiConfig.ACCOUNTS_PATH + "/" + id + "/nickname")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the monthly summary is fetched")
    public void theMonthlySummaryIsFetched() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/summary/monthly")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Asserts that the HTTP status code of the last response matches the expected value.
     */
    @Then("the response status is {int}")
    public void theResponseStatusIs(int statusCode) {
        assertThat(ctx.getLastResponse().statusCode(), is(statusCode));
    }

    /**
     * Asserts that the ownerName field in the last response matches the expected value.
     */
    @Then("the account owner is {string}")
    public void theAccountOwnerIs(String expectedOwner) {
        assertThat(ctx.getLastResponse().jsonPath().getString("ownerName"), is(expectedOwner));
    }

    /**
     * Asserts that the accountType field in the last response matches the expected value.
     */
    @Then("the account type is {string}")
    public void theAccountTypeIs(String expectedType) {
        assertThat(ctx.getLastResponse().jsonPath().getString("accountType"), is(expectedType));
    }

    /**
     * Asserts that the balance field in the last response matches the expected value.
     */
    @Then("the account balance is {double}")
    public void theAccountBalanceIs(double expectedBalance) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("balance"), is(expectedBalance));
    }

    /**
     * Asserts that the frozen field in the last response is false.
     */
    @Then("the account is not frozen")
    public void theAccountIsNotFrozen() {
        assertThat(ctx.getLastResponse().jsonPath().getBoolean("frozen"), is(false));
    }

    /**
     * Asserts that the frozen field in the last response is true.
     */
    @Then("the account is now frozen")
    public void theAccountIsFrozenAssertion() {
        assertThat(ctx.getLastResponse().jsonPath().getBoolean("frozen"), is(true));
    }

    @Then("the account nickname is {string}")
    public void theAccountNicknameIs(String expectedNickname) {
        assertThat(ctx.getLastResponse().jsonPath().getString("nickname"), is(expectedNickname));
    }

    @Then("the monthly summary income is {double}")
    public void theMonthlySummaryIncomeIs(double expectedIncome) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("income"), is(expectedIncome));
    }

    @Then("the monthly summary spending is {double}")
    public void theMonthlySummarySpendingIs(double expectedSpending) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("spending"), is(expectedSpending));
    }

    @Then("the monthly summary net cash flow is {double}")
    public void theMonthlySummaryNetCashFlowIs(double expectedNetCashFlow) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("netCashFlow"), is(expectedNetCashFlow));
    }

    @Then("the monthly summary includes category {string} with spending {double}")
    public void theMonthlySummaryIncludesCategoryWithSpending(String category, double spending) {
        java.util.List<Map<String, Object>> categories = ctx.getLastResponse().jsonPath().getList("categories");
        boolean match = categories.stream().anyMatch(item ->
            category.equals(item.get("category")) &&
            Double.compare(((Number) item.get("spending")).doubleValue(), spending) == 0
        );
        assertThat("Expected category spending was not found", match, is(true));
    }

    /**
     * Asserts that the last response contains at least the specified number of accounts.
     * Used to verify the list-all-accounts endpoint returns a non-empty result.
     */
    @Then("the response contains at least {int} account")
    public void theResponseContainsAtLeastNAccounts(int min) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), greaterThanOrEqualTo(min));
    }

    /**
     * Asserts that the list of accounts in the last response contains an entry with the given ownerName.
     */
    @Then("the list includes an account for {string}")
    public void theListIncludesAnAccountFor(String ownerName) {
        java.util.List<String> owners = ctx.getLastResponse().jsonPath().getList("ownerName");
        assertThat(owners, hasItem(ownerName));
    }

    /**
     * Asserts that the error field in the last response matches the expected message.
     */
    @Then("the error message is {string}")
    public void theErrorMessageIs(String expectedMessage) {
        assertThat(ctx.getLastResponse().jsonPath().getString("error"), is(expectedMessage));
    }

    /**
     * Helper method that sends a POST request to create an account with the given owner name and type.
     *
     * @param ownerName   the name of the account holder
     * @param accountType the account type, either "CHEQUING" or "SAVINGS"
     * @return the raw REST Assured response
     */
    private Response createAccount(String ownerName, String accountType) {
        Map<String, String> body = new HashMap<>();
        body.put("ownerName", ownerName);
        body.put("accountType", accountType);

        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH)
            .then()
                .extract().response();
    }

    private RequestSpecification baseRequest() {
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId())
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET);
    }
}
