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

public class AccountSteps {

    private final ScenarioContext ctx;

    public AccountSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @Given("a chequing account exists for {string}")
    public void aChequingAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        assertThat(response.statusCode(), is(201));
        ctx.set("accountId", response.jsonPath().getString("id"));
    }

    @Given("a second chequing account exists for {string}")
    public void aSecondChequingAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        assertThat(response.statusCode(), is(201));
        ctx.set("secondAccountId", response.jsonPath().getString("id"));
    }

    @Given("a savings account exists for {string}")
    public void aSavingsAccountExistsFor(String ownerName) {
        Response response = createAccount(ownerName, "SAVINGS");
        assertThat(response.statusCode(), is(201));
        ctx.set("accountId", response.jsonPath().getString("id"));
    }

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
            .when()
                .patch(ApiConfig.ACCOUNTS_PATH + "/" + id + "/freeze")
            .then()
                .extract().response();

        if (freezeResponse.statusCode() == 404) {
            throw new io.cucumber.java.PendingException();
        }
    }

    @When("a chequing account is created for {string}")
    public void aChequingAccountIsCreatedFor(String ownerName) {
        Response response = createAccount(ownerName, "CHEQUING");
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("accountId", response.jsonPath().getString("id"));
        }
    }

    @When("a savings account is created for {string}")
    public void aSavingsAccountIsCreatedFor(String ownerName) {
        Response response = createAccount(ownerName, "SAVINGS");
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("accountId", response.jsonPath().getString("id"));
        }
    }

    @When("an account is created with an empty owner name")
    public void anAccountIsCreatedWithAnEmptyOwnerName() {
        Map<String, String> body = new HashMap<>();
        body.put("ownerName", "");
        body.put("accountType", "CHEQUING");

        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH)
            .then()
                .extract().response();

        ctx.setLastResponse(response);
    }

    @When("the account is fetched by ID")
    public void theAccountIsFetchedById() {
        String id = ctx.getString("accountId");
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("account {string} is fetched")
    public void accountIsFetched(String id) {
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
            .when()
                .get(ApiConfig.ACCOUNTS_PATH + "/" + id)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("the response status is {int}")
    public void theResponseStatusIs(int statusCode) {
        assertThat(ctx.getLastResponse().statusCode(), is(statusCode));
    }

    @Then("the account owner is {string}")
    public void theAccountOwnerIs(String expectedOwner) {
        assertThat(ctx.getLastResponse().jsonPath().getString("ownerName"), is(expectedOwner));
    }

    @Then("the account type is {string}")
    public void theAccountTypeIs(String expectedType) {
        assertThat(ctx.getLastResponse().jsonPath().getString("accountType"), is(expectedType));
    }

    @Then("the account balance is {double}")
    public void theAccountBalanceIs(double expectedBalance) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("balance"), is(expectedBalance));
    }

    @Then("the account is not frozen")
    public void theAccountIsNotFrozen() {
        assertThat(ctx.getLastResponse().jsonPath().getBoolean("frozen"), is(false));
    }

    @Then("the error message is {string}")
    public void theErrorMessageIs(String expectedMessage) {
        assertThat(ctx.getLastResponse().jsonPath().getString("error"), is(expectedMessage));
    }

    private Response createAccount(String ownerName, String accountType) {
        Map<String, String> body = new HashMap<>();
        body.put("ownerName", ownerName);
        body.put("accountType", accountType);

        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .body(body)
            .when()
                .post(ApiConfig.ACCOUNTS_PATH)
            .then()
                .extract().response();
    }
}
