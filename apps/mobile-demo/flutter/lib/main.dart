import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

/// Override at run time:
/// flutter run --dart-define=API_BASE=http://192.168.1.42:3080
const apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://127.0.0.1:3080',
);

void main() => runApp(const SecureDemoApp());

class SecureDemoApp extends StatefulWidget {
  const SecureDemoApp({super.key});

  @override
  State<SecureDemoApp> createState() => _SecureDemoAppState();
}

class _SecureDemoAppState extends State<SecureDemoApp> {
  late final TextEditingController _url;
  String _out = 'Set LAN URL (not localhost on a real phone), then Hello.';

  @override
  void initState() {
    super.initState();
    _url = TextEditingController(text: apiBase);
  }

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  Future<void> _hello() async {
    final base = _url.text.replaceAll(RegExp(r'/$'), '');
    final uri = Uri.parse('$base/api/hello');
    setState(() => _out = 'GET $uri …');
    try {
      final res = await http.get(uri, headers: {'Accept': 'application/json'});
      setState(() => _out = 'GET $uri\nstatus ${res.statusCode}\n${res.body}');
    } catch (e) {
      setState(() {
        _out =
            'GET $uri\nFAILED: $e\n\nPhysical phone: use http://PC_LAN_IP:3080\n'
            'Check Windows Firewall and Wi-Fi isolation.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(
          title: const Text('Secure Demo (Flutter)'),
          backgroundColor: const Color(0xFF134E4A),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'localhost on a phone is the phone. CORS does not apply to dart:http.',
                style: TextStyle(color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _url,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  labelText: 'API base (edge + port)',
                  labelStyle: TextStyle(color: Color(0xFFCBD5E1)),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _hello,
                child: const Text('GET /api/hello'),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: SingleChildScrollView(
                  child: Text(
                    _out,
                    style: const TextStyle(
                      color: Color(0xFF86EFAC),
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
