package steps;

import config.ApiConfig;
import context.ScenarioContext;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;

public class NotificationsSteps {

    private final ScenarioContext ctx;

    public NotificationsSteps(ScenarioContext ctx) {
        this.ctx = ctx;
    }

    @When("notifications are fetched")
    public void notificationsAreFetched() {
        ctx.setLastResponse(fetchNotifications());
    }

    @When("notifications are fetched without authentication")
    public void notificationsAreFetchedWithoutAuthentication() {
        Response response = RestAssured
            .given()
                .baseUri(ApiConfig.BASE_URL)
                .contentType(ContentType.JSON)
                .header("X-Internal-Secret", ApiConfig.INTERNAL_SECRET)
            .when()
                .get(ApiConfig.NOTIFICATIONS_PATH)
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the {string} notification is marked read")
    public void theNotificationOfKindIsMarkedRead(String kind) {
        String id = findNotificationIdByKind(kind);
        ctx.setLastResponse(markRead(id));
    }

    @When("the notification {string} is marked read")
    public void theLiteralNotificationIsMarkedRead(String notificationId) {
        ctx.setLastResponse(markRead(notificationId));
    }

    @When("all notifications are marked read")
    public void allNotificationsAreMarkedRead() {
        Response response = RestAssured
            .given(baseRequest())
            .when()
                .post(ApiConfig.NOTIFICATIONS_PATH + "/read-all")
            .then()
                .extract().response();
        ctx.setLastResponse(response);
    }

    @When("the {string} notification is dismissed")
    public void theNotificationOfKindIsDismissed(String kind) {
        String id = findNotificationIdByKind(kind);
        ctx.setLastResponse(dismiss(id));
    }

    @When("the notification {string} is dismissed")
    public void theLiteralNotificationIsDismissed(String notificationId) {
        ctx.setLastResponse(dismiss(notificationId));
    }

    @Then("the notification list includes kind {string} with title {string}")
    public void theNotificationListIncludesKindWithTitle(String kind, String title) {
        List<Map<String, Object>> notifications = ctx.getLastResponse().jsonPath().getList("notifications");
        boolean match = notifications.stream()
            .anyMatch(n -> kind.equals(n.get("kind")) && title.equals(n.get("title")));
        assertThat("Expected notification not found", match, is(true));
    }

    @Then("the notification list does not include kind {string}")
    public void theNotificationListDoesNotIncludeKind(String kind) {
        List<String> kinds = ctx.getLastResponse().jsonPath().getList("notifications.kind");
        assertThat(kinds, not(hasItem(kind)));
    }

    @Then("the unread count is at least {int}")
    public void theUnreadCountIsAtLeast(int min) {
        assertThat(ctx.getLastResponse().jsonPath().getInt("unreadCount"), greaterThanOrEqualTo(min));
    }

    @Then("the notifications unread count is {int}")
    public void theNotificationsUnreadCountIs(int expected) {
        assertThat(ctx.getLastResponse().jsonPath().getInt("unreadCount"), is(expected));
    }

    @Then("the notification status is {string}")
    public void theNotificationStatusIs(String expectedStatus) {
        assertThat(ctx.getLastResponse().jsonPath().getString("status"), is(expectedStatus));
    }

    @Then("the read count is at least {int}")
    public void theReadCountIsAtLeast(int min) {
        assertThat(ctx.getLastResponse().jsonPath().getInt("updated"), greaterThanOrEqualTo(min));
    }

    private String findNotificationIdByKind(String kind) {
        Response response = fetchNotifications();
        List<Map<String, Object>> notifications = response.jsonPath().getList("notifications");
        return notifications.stream()
            .filter(n -> kind.equals(n.get("kind")))
            .map(n -> (String) n.get("id"))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No notification found for kind " + kind));
    }

    private Response fetchNotifications() {
        return RestAssured
            .given(baseRequest())
            .when()
                .get(ApiConfig.NOTIFICATIONS_PATH)
            .then()
                .extract().response();
    }

    private Response markRead(String notificationId) {
        return RestAssured
            .given(baseRequest())
            .when()
                .patch(ApiConfig.NOTIFICATIONS_PATH + "/" + notificationId + "/read")
            .then()
                .extract().response();
    }

    private Response dismiss(String notificationId) {
        return RestAssured
            .given(baseRequest())
            .when()
                .delete(ApiConfig.NOTIFICATIONS_PATH + "/" + notificationId)
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
