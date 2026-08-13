package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;

public class SavingsGoalsSteps {

    private final ScenarioContext ctx;

    public SavingsGoalsSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("a savings goal named {string} is created for the account with target amount {double}")
    public void aSavingsGoalIsCreatedForTheAccount(String name, double targetAmount) {
        Response response = createGoal(ctx.getString("accountId"), name, targetAmount);
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("goalId", response.jsonPath().getString("id"));
        }
    }

    @Given("a savings goal named {string} exists for the account with target amount {double}")
    public void aSavingsGoalExistsForTheAccount(String name, double targetAmount) {
        Response response = createGoal(ctx.getString("accountId"), name, targetAmount);
        assertThat(response.statusCode(), is(201));
        ctx.set("goalId", response.jsonPath().getString("id"));
    }

    @When("a savings goal named {string} is created for account {string} with target amount {double}")
    public void aSavingsGoalIsCreatedForAccount(String name, String accountId, double targetAmount) {
        ctx.setLastResponse(createGoal(accountId, name, targetAmount));
    }

    @When("all savings goals are listed")
    public void allSavingsGoalsAreListed() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.SAVINGS_GOALS_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("savings goals are listed without authentication")
    public void savingsGoalsAreListedWithoutAuthentication() {
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET)
            .when()
                .get(ApiConfig.SAVINGS_GOALS_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the savings goal is updated to name {string}, target amount {double}")
    public void theSavingsGoalIsUpdatedToNameTargetAmount(String name, double targetAmount) {
        ctx.setLastResponse(updateGoal(ctx.getString("goalId"), ctx.getString("accountId"), name, targetAmount));
    }

    @When("the savings goal is updated to account {string}, name {string}, target amount {double}")
    public void theSavingsGoalIsUpdatedToAccountNameTargetAmount(String accountId, String name, double targetAmount) {
        ctx.setLastResponse(updateGoal(ctx.getString("goalId"), accountId, name, targetAmount));
    }

    @When("the savings goal {string} is updated to account {string}, name {string}, target amount {double}")
    public void theLiteralSavingsGoalIsUpdatedToAccountNameTargetAmount(String goalId, String accountId, String name, double targetAmount) {
        ctx.setLastResponse(updateGoal(goalId, accountId, name, targetAmount));
    }

    @When("the savings goal is deleted")
    public void theSavingsGoalIsDeleted() {
        ctx.setLastResponse(deleteGoal(ctx.getString("goalId")));
    }

    @When("the savings goal {string} is deleted")
    public void theLiteralSavingsGoalIsDeleted(String goalId) {
        ctx.setLastResponse(deleteGoal(goalId));
    }

    @When("a savings goal is created without an accountId")
    public void aSavingsGoalIsCreatedWithoutAnAccountId() {
        Map<String, Object> body = new HashMap<>();
        body.put("name", "Nameless");
        body.put("targetAmount", 100.0);
        ctx.setLastResponse(postGoal(body));
    }

    @When("a savings goal is created without a name")
    public void aSavingsGoalIsCreatedWithoutAName() {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", ctx.getString("accountId"));
        body.put("targetAmount", 100.0);
        ctx.setLastResponse(postGoal(body));
    }

    @Then("the goal name is {string}")
    public void theGoalNameIs(String expectedName) {
        assertThat(ctx.getLastResponse().jsonPath().getString("name"), is(expectedName));
    }

    @Then("the goal target amount is {double}")
    public void theGoalTargetAmountIs(double expectedTargetAmount) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("targetAmount"), is(expectedTargetAmount));
    }

    @Then("the goal percentage reached is {double}")
    public void theGoalPercentageReachedIs(double expectedPercentage) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("percentageReached"), is(expectedPercentage));
    }

    @Then("the goal list includes name {string}")
    public void theGoalListIncludesName(String name) {
        List<String> names = ctx.getLastResponse().jsonPath().getList("name");
        assertThat(names, hasItem(name));
    }

    @Then("the goal list has {int} goal")
    public void theGoalListHasGoal(int count) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(count));
    }

    private Response createGoal(String accountId, String name, double targetAmount) {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", accountId);
        body.put("name", name);
        body.put("targetAmount", targetAmount);
        return postGoal(body);
    }

    private Response postGoal(Map<String, Object> body) {
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.SAVINGS_GOALS_PATH)
            .then()
                .extract().response();
    }

    private Response updateGoal(String goalId, String accountId, String name, double targetAmount) {
        Map<String, Object> body = new HashMap<>();
        body.put("accountId", accountId);
        body.put("name", name);
        body.put("targetAmount", targetAmount);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.SAVINGS_GOALS_PATH + "/" + goalId)
            .then()
                .extract().response();
    }

    private Response deleteGoal(String goalId) {
        return RestAssured
            .given(baseRequest())
            .when()
                .delete(ApiConfig.SAVINGS_GOALS_PATH + "/" + goalId)
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
