package steps;

import config.ApiConfig;
import context.ScenarioContext;
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

public class BudgetSteps {

    private final ScenarioContext ctx;

    public BudgetSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("a {string} budget is saved with monthly limit {double}")
    public void aBudgetIsSavedWithMonthlyLimit(String category, double monthlyLimit) {
        Response response = saveBudget(category, monthlyLimit);
        ctx.setLastResponse(response);
        if (response.statusCode() == 200) {
            ctx.set("budgetId", response.jsonPath().getString("id"));
        }
    }

    @When("all budgets are listed")
    public void allBudgetsAreListed() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.BUDGETS_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the saved budget is deleted")
    public void theSavedBudgetIsDeleted() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .delete(ApiConfig.BUDGETS_PATH + "/" + ctx.getString("budgetId"))
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @Then("the budget category is {string}")
    public void theBudgetCategoryIs(String category) {
        assertThat(ctx.getLastResponse().jsonPath().getString("category"), is(category));
    }

    @Then("the budget monthly limit is {double}")
    public void theBudgetMonthlyLimitIs(double monthlyLimit) {
        assertThat(ctx.getLastResponse().jsonPath().getDouble("monthlyLimit"), is(monthlyLimit));
    }

    @Then("the budget list includes category {string}")
    public void theBudgetListIncludesCategory(String category) {
        List<String> categories = ctx.getLastResponse().jsonPath().getList("category");
        assertThat(categories, hasItem(category));
    }

    @Then("the budget list has {int} budget")
    public void theBudgetListHasBudget(int count) {
        assertThat(ctx.getLastResponse().jsonPath().getList("$").size(), is(count));
    }

    @Then("the {string} budget current spending is {double}")
    public void theBudgetCurrentSpendingIs(String category, double expectedSpending) {
        List<Map<String, Object>> budgets = ctx.getLastResponse().jsonPath().getList("$");
        boolean match = budgets.stream().anyMatch(budget ->
            category.equals(budget.get("category")) &&
            Double.compare(((Number) budget.get("currentSpending")).doubleValue(), expectedSpending) == 0
        );
        assertThat("Expected budget current spending was not found", match, is(true));
    }

    private Response saveBudget(String category, double monthlyLimit) {
        Map<String, Object> body = new HashMap<>();
        body.put("category", category);
        body.put("monthlyLimit", monthlyLimit);

        return RestAssured
            .given(baseRequest())
                .body(body)
            .when()
                .put(ApiConfig.BUDGETS_PATH)
            .then()
                .extract().response();
    }

    private RequestSpecification baseRequest() {
        return RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-User-Id", ctx.getUserId());
    }
}
