package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.*;
import io.restassured.RestAssured;
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

    @Given("the account has been funded with {double}")
    public void theAccountHasBeenFundedWith(double amount) {
        String id = ctx.getString("accountId");
        Response response = deposit(id, amount, null);
        assertThat(response.statusCode(), is(200));
    }

    @Given("{double} is deposited into the account with description {string}")
    public void isDepositedWithDescription(double amount, String description) {
        String id = ctx.getString("accountId");
        Response response = deposit(id, amount, description);
        assertThat(response.statusCode(), is(200));
    }

    @Given("{double} is withdrawn from the account with description {string}")
    public void isWithdrawnWithDescription(double amount, String description) {
        String id = ctx.getString("accountId");
        Response response = withdraw(id, amount, description);
        assertThat(response.statusCode(), is(200));
    }

    @When("{double} is deposited into the account")
    public void depositIntoAccount(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(deposit(id, amount, null));
    }

    @When("{double} is withdrawn from the account")
    public void withdrawFromAccount(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(withdraw(id, amount, null));
    }

    @When("{double} is transferred to the second account")
    public void transferToSecondAccount(double amount) {
        String fromId = ctx.getString("accountId");
        String toId = ctx.getString("secondAccountId");
        ctx.setLastResponse(transfer(fromId, toId, amount, null));
    }

    @When("{double} is transferred to account {string}")
    public void transferToAccount(double amount, String toId) {
        String fromId = ctx.getString("accountId");
        ctx.setLastResponse(transfer(fromId, toId, amount, null));
    }

    @When("{double} is transferred to itself")
    public void transferToItself(double amount) {
        String id = ctx.getString("accountId");
        ctx.setLastResponse(transfer(id, id, amount, null));
    }

    @When("the transaction history is fetched")
    public void theTransactionHistoryIsFetched() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id + "/transactions")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("there are {int} transactions")
    public void thereAreTransactions(int expectedCount) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(expectedCount));
    }

    private Response deposit(String accountId, double amount, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount);
        if (description != null) body.put("description", description);
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + accountId + "/deposit")
            .then()
                .extract().response();
    }

    private Response withdraw(String accountId, double amount, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amount);
        if (description != null) body.put("description", description);
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + accountId + "/withdraw")
            .then()
                .extract().response();
    }

    private Response transfer(String fromId, String toId, double amount, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("toAccountId", toId);
        body.put("amount", amount);
        if (description != null) body.put("description", description);
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH + "/" + fromId + "/transfer")
            .then()
                .extract().response();
    }
}
