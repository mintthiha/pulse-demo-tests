package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class RecurringSteps {

    private final ScenarioContext ctx;

    public RecurringSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("recurring rules are listed")
    public void recurringRulesAreListed() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("recurring rules are listed without authentication")
    public void recurringRulesAreListedWithoutAuthentication() {
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
            .when()
                .get(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("a recurring {string} rule named {string} is created for the account with amount {double}, category {string}, frequency {string}, due in {int} days")
    public void aRecurringRuleIsCreatedForTheAccount(
        String type,
        String name,
        double amount,
        String category,
        String frequency,
        int dueInDays
    ) {
        Response response = createRecurringRule(type, name, amount, category, frequency, dueInDays);
        ctx.setLastResponse(response);
        if (response.statusCode() == 201) {
            ctx.set("recurringId", response.jsonPath().getString("id"));
        }
    }

    @When("a due recurring {string} rule named {string} is created for the account with amount {double}, category {string}, and frequency {string}")
    public void aDueRecurringRuleIsCreatedForTheAccount(
        String type,
        String name,
        double amount,
        String category,
        String frequency
    ) {
        Response response = createRecurringRule(type, name, amount, category, frequency, -1);
        assertThat(response.statusCode(), is(201));
        ctx.set("recurringId", response.jsonPath().getString("id"));
        ctx.setLastResponse(response);
    }

    @When("a recurring rule is created without a name")
    public void aRecurringRuleIsCreatedWithoutAName() {
        Map<String, Object> body = validRecurringBody("WITHDRAWAL", "", 100.0, "Rent", "MONTHLY", 10);
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("a recurring rule is created with invalid frequency {string}")
    public void aRecurringRuleIsCreatedWithInvalidFrequency(String frequency) {
        Map<String, Object> body = validRecurringBody("WITHDRAWAL", "Invalid frequency rule", 100.0, "Rent", frequency, 10);
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("a recurring rule is created with an end date before the start date")
    public void aRecurringRuleIsCreatedWithEndDateBeforeStartDate() {
        Map<String, Object> body = validRecurringBody("WITHDRAWAL", "Invalid date rule", 100.0, "Rent", "MONTHLY", 10);
        body.put("endDate", Instant.now().plus(5, ChronoUnit.DAYS).toString());
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the recurring rule is updated to name {string}, amount {double}, category {string}, frequency {string}")
    public void theRecurringRuleIsUpdatedTo(String name, double amount, String category, String frequency) {
        Map<String, Object> body = validRecurringBody("WITHDRAWAL", name, amount, category, frequency, 21);
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.RECURRING_PATH + "/" + ctx.getString("recurringId"))
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the recurring rule active state is set to {word}")
    public void theRecurringRuleActiveStateIsSetTo(String activeText) {
        Map<String, Object> body = new HashMap<>();
        body.put("active", Boolean.parseBoolean(activeText));
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .patch(ApiConfig.RECURRING_PATH + "/" + ctx.getString("recurringId"))
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the recurring rule active state is set to a non-boolean value")
    public void theRecurringRuleActiveStateIsSetToANonBooleanValue() {
        Map<String, Object> body = new HashMap<>();
        body.put("active", "false");
        Response response = RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .patch(ApiConfig.RECURRING_PATH + "/" + ctx.getString("recurringId"))
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the recurring rule is deleted")
    public void theRecurringRuleIsDeleted() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .delete(ApiConfig.RECURRING_PATH + "/" + ctx.getString("recurringId"))
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("due recurring rules are applied")
    public void dueRecurringRulesAreApplied() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .post(ApiConfig.RECURRING_PATH + "/apply-due")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("the recurring rule name is {string}")
    public void theRecurringRuleNameIs(String expectedName) {
        assertThat(ctx.getLastResponse().jsonPath().getString("name"), is(expectedName));
    }

    @Then("the recurring rule type is {string}")
    public void theRecurringRuleTypeIs(String expectedType) {
        assertThat(ctx.getLastResponse().jsonPath().getString("type"), is(expectedType));
    }

    @Then("the recurring rule amount is {double}")
    public void theRecurringRuleAmountIs(double expectedAmount) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("amount"), is(expectedAmount));
    }

    @Then("the recurring rule category is {string}")
    public void theRecurringRuleCategoryIs(String expectedCategory) {
        assertThat(ctx.getLastResponse().jsonPath().getString("category"), is(expectedCategory));
    }

    @Then("the recurring rule frequency is {string}")
    public void theRecurringRuleFrequencyIs(String expectedFrequency) {
        assertThat(ctx.getLastResponse().jsonPath().getString("frequency"), is(expectedFrequency));
    }

    @Then("the recurring rule is active")
    public void theRecurringRuleIsActive() {
        assertThat(ctx.getLastResponse().jsonPath().getBoolean("active"), is(true));
    }

    @Then("the recurring rule is paused")
    public void theRecurringRuleIsPaused() {
        assertThat(ctx.getLastResponse().jsonPath().getBoolean("active"), is(false));
    }

    @Then("the recurring rule next run matches the start date")
    public void theRecurringRuleNextRunMatchesTheStartDate() {
        assertThat(ctx.getLastResponse().jsonPath().getString("nextRunAt"), is(ctx.getString("recurringStartDate")));
    }

    @Then("the recurring rule includes account metadata for {string}")
    public void theRecurringRuleIncludesAccountMetadataFor(String ownerName) {
        assertThat(ctx.getLastResponse().jsonPath().getString("accountOwnerName"), is(ownerName));
        assertThat(ctx.getLastResponse().jsonPath().getString("accountType"), is("CHEQUING"));
    }

    @Then("the recurring list includes rule {string}")
    public void theRecurringListIncludesRule(String name) {
        List<String> names = ctx.getLastResponse().jsonPath().getList("name");
        assertThat(names, hasItem(name));
    }

    @Then("the recurring list has {int} rule")
    public void theRecurringListHasRule(int count) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(count));
    }

    @Then("the recurring apply result has {int} applied and {int} failed")
    public void theRecurringApplyResultHasAppliedAndFailed(int applied, int failed) {
        assertThat(ctx.getLastResponse().jsonPath().getInt("appliedCount"), is(applied));
        assertThat(ctx.getLastResponse().jsonPath().getInt("failedCount"), is(failed));
    }

    @Then("the recurring apply failure message is {string}")
    public void theRecurringApplyFailureMessageIs(String message) {
        assertThat(ctx.getLastResponse().jsonPath().getString("failures[0].message"), is(message));
    }

    private Response createRecurringRule(String type, String name, double amount, String category, String frequency, int dueInDays) {
        Map<String, Object> body = validRecurringBody(type, name, amount, category, frequency, dueInDays);
        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .post(ApiConfig.RECURRING_PATH)
            .then()
                .extract().response();
    }

    private Map<String, Object> validRecurringBody(String type, String name, double amount, String category, String frequency, int dueInDays) {
        String startDate = Instant.now().plus(dueInDays, ChronoUnit.DAYS).truncatedTo(ChronoUnit.MILLIS).toString();
        ctx.set("recurringStartDate", startDate);

        Map<String, Object> body = new HashMap<>();
        body.put("accountId", ctx.getString("accountId"));
        body.put("name", name);
        body.put("type", type);
        body.put("amount", amount);
        body.put("category", category);
        body.put("description", name + " generated by API tests");
        body.put("frequency", frequency);
        body.put("startDate", startDate);
        return body;
    }

    private RequestSpecification baseRequest() {
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId());
    }
}
