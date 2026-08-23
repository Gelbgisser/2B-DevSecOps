package lab.secure;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GreetingTest {
  @Test
  void helloWithName() {
    assertEquals("hello Ada", Greeting.hello("Ada"));
  }

  @Test
  void helloBlank() {
    assertEquals("hello", Greeting.hello("  "));
  }
}
