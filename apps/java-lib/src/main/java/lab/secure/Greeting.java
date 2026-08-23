package lab.secure;

public final class Greeting {
  private Greeting() {}

  public static String hello(String name) {
    if (name == null || name.isBlank()) {
      return "hello";
    }
    return "hello " + name.trim();
  }
}
