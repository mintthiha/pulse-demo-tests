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

public class TransactionSteps {

    private final ScenarioContext ctx;

    public TransactionSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    /**
     * Deposits the given amount into the current account as a silent precondition.
     * Asserts that the deposit succeeds with a 200 response.
     */
    @Given("the account has been funded with {double}")
    public void theAccountHasBeenFundedWith(double amount) {
        String id = ctx.getString("accountId");
        Response response = deposit(id, amount, null);
        assertThat(response.statusCode(), is(200));
    }

    /**
     * Deposits the given amount with a description into the current account as a silent precondition.
     * Asserts that the deposit succeeds with a 200 response.
     */
    @Given("{double} is deposited into the account with description {string}")
    public void isDepositedWithDescription(double amount, String description) {
        String id = ctx.getString("accountId");
        Response response = deposit(id, amount, description);
        assertThat(response.statusCode(), is(200));
    }

    @Given("{double} is deposited into the account with category {string}")
    public void isDepositedWithCategory(double amount, String category) {
        String id = ctx.getString("accountId");
        Response response = deposit(id, amount, category, null);
        assertThat(response.statusCode(), is(200));
    }

    /**
     * Withdraws the given amount with a description from the current account as a silent precondition.
     * Asserts that the withdrawal succeeds with a 200 response.
     */
    @Given("{double} is withdrawn from the account with description {string}")
    public void isWithdrawnWithDescription(double amount, String description) {
        String id = ctx.getString("accountId");
        Response response = withdraw(id, amount, description);
        assertThat(response.statusCode(), is(200));
    }

    @Given("{double} is withdrawn from the account with category {string}")
    public void isWithdrawnWithCategory(double amount, String category) {
        String id = ctx.getString("accountId");
        Response response = withdraw(id, amount, category, null);
        assertThat(response.statusCode(), is(200));
    }

    /**
     * Sends a POST request to deposit the given amount into the current account.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("{double} is deposited into the account")
    public void depositIntoAccount(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(deposit(id, amount, null));
    }

    /**
     * Sends a POST request to withdraw the given amount from the current account.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("{double} is withdrawn from the account")
    public void withdrawFromAccount(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(withdraw(id, amount, null));
    }

    /**
     * Sends a POST request to transfer the given amount from the current account to the second account.
     * Both account IDs are read from the scenario context.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("{double} is transferred to the second account")
    public void transferToSecondAccount(double amount) {
        String fromId = ctx.getString("accountId");
        String toId = ctx.getString("secondAccountId");
        ctx.setLastResponse(transfer(fromId, toId, amount, null));
    }

    /**
     * Sends a POST request to transfer the given amount from the current account to a literal account ID.
     * Used to test transfers to nonexistent or arbitrary accounts.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("{double} is transferred to account {string}")
    public void transferToAccount(double amount, String toId) {
        String fromId = ctx.getString("accountId");
        ctx.setLastResponse(transfer(fromId, toId, amount, null));
    }

    /**
     * Sends a POST request to transfer the given amount from the current account to itself.
     * Used to verify that self-transfers are rejected by the API.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("{double} is transferred to itself")
    public void transferToItself(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(transfer(id, id, amount, null));
    }

    /**
     * Sends a GET request to fetch the transaction history for the current account.
     * Stores the response as the last response for subsequent assertions.
     */
    @When("the transaction history is fetched")
    public void theTransactionHistoryIsFetched() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id + "/transactions")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    /**
     * Asserts that the transaction list in the last response contains exactly the expected number of entries.
     */
    @Then("there are {int} transactions")
    public void thereAreTransactions(int expectedCount) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(expectedCount));
    }

    @Then("at least one transaction has category {string}")
    public void atLeastOneTransactionHasCategory(String expectedCategory) {
        java.util.List<String> categories = ctx.getLastResponse().jsonPath().getList("category");
        assertThat(categories, hasItem(expectedCategory));
    }

    /**
     * Helper method that sends a POST request to deposit an amount into an account.
     *
     * @param accountId   the ID of the account to deposit into
     * @param amount      the amount to deposit
     * @param description optional transaction description; omitted from the request body if null
     * @return the raw REST Assured response
     */
    private Response deposit(String accountId, double amount, String description) {
        return deposit(accountId, amount, null, description);
    }

    private Response deposit(String accountId, double amount, String category, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount);
        if (category != null) body.put("category", category);
        if (description != null) body.put("description", description);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + accountId + "/deposit")
            .then()
                .extract().response();
    }

    /**
     * Helper method that sends a POST request to withdraw an amount from an account.
     *
     * @param accountId   the ID of the account to withdraw from
     * @param amount      the amount to withdraw
     * @param description optional transaction description; omitted from the request body if null
     * @return the raw REST Assured response
     */
    private Response withdraw(String accountId, double amount, String description) {
        return withdraw(accountId, amount, null, description);
    }

    private Response withdraw(String accountId, double amount, String category, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount);
        if (category != null) body.put("category", category);
        if (description != null) body.put("description", description);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + accountId + "/withdraw")
            .then()
                .extract().response();
    }

    /**
     * Helper method that sends a POST request to transfer an amount between two accounts.
     *
     * @param fromId      the ID of the source account
     * @param toId        the ID of the destination account
     * @param amount      the amount to transfer
     * @param description optional transaction description; omitted from the request body if null
     * @return the raw REST Assured response
     */
    private Response transfer(String fromId, String toId, double amount, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("toAccountId", toId);
        body.put("amount", amount);
        if (description != null) body.put("description", description);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + fromId + "/transfer")
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
