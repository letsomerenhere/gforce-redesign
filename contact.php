<?php
// contact.php — GoDaddy cPanel version using PHP mail() only

/* =======================
   CONFIG — EDIT THESE
   ======================= */
const TO_EMAIL      = 'info@thegforce.com';
const TO_NAME       = 'GForce Technology Consulting';
const THANK_YOU_URL = '/thank-you.html';

// reCAPTCHA secret for your site
const RECAPTCHA_SECRET = '6LdFw_srAAAAAK34mxmQ66OtIvYPCm--8I9SUdaW';

// Optional: get a copy of each form to your inbox for testing
const BCC_EMAIL = ''; // e.g. 'your.personal@gmail.com' or '' to disable

/* =======================
   HELPERS
   ======================= */
function clean($v){ return trim(strip_tags($v)); }
function fail_with_errors(array $errors){
  http_response_code(400);
  echo '<!doctype html><html><head><meta charset="utf-8"><title>Submission Error</title></head><body>';
  echo '<h1>There was a problem with your submission</h1><ul>';
  foreach ($errors as $e) echo '<li>' . htmlspecialchars($e) . '</li>';
  echo '</ul><p><a href="contact.html">Go back and try again</a></p></body></html>';
  exit;
}

/* =======================
   METHOD + HONEYPOT
   ======================= */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Method Not Allowed');
}

// Honeypot: field name "website" in your HTML
if (!empty($_POST['website'] ?? '')) {
  header('Location: ' . THANK_YOU_URL);
  exit;
}

/* =======================
   COLLECT FIELDS
   ======================= */
$first   = clean($_POST['first_name'] ?? '');
$last    = clean($_POST['last_name'] ?? '');
$email   = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$phone   = clean($_POST['phone'] ?? '');
$title   = clean($_POST['title'] ?? '');
$company = clean($_POST['company'] ?? '');
$ref     = clean($_POST['referrer'] ?? '');
$help    = trim($_POST['help'] ?? '');
$consent = isset($_POST['consent']);

/* =======================
   VALIDATION
   ======================= */
$errors = [];
if ($first === '')   $errors[] = 'First name is required.';
if ($last === '')    $errors[] = 'Last name is required.';
if (!$email)         $errors[] = 'A valid email is required.';
if ($phone === '')   $errors[] = 'Phone is required.';
if ($company === '') $errors[] = 'Company is required.';
if ($help === '')    $errors[] = 'Please tell us how we can help.';
if (!$consent)       $errors[] = 'Consent is required.';

/* =======================
   reCAPTCHA VERIFY
   ======================= */
$captchaToken = $_POST['g-recaptcha-response'] ?? '';
if ($captchaToken === '') {
  $errors[] = 'reCAPTCHA missing.';
} else {
  $verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
  $postData = http_build_query([
    'secret'   => RECAPTCHA_SECRET,
    'response' => $captchaToken,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? null
  ]);
  $ch = curl_init($verifyURL);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postData,
    CURLOPT_TIMEOUT        => 6,
  ]);
  $result = curl_exec($ch);
  $curlErr = curl_error($ch);
  curl_close($ch);

  if ($result === false) {
    error_log("reCAPTCHA cURL error: $curlErr");
    $errors[] = 'reCAPTCHA verification failed (network).';
  } else {
    $json = json_decode($result, true);
    if (!($json['success'] ?? false)) {
      $errors[] = 'reCAPTCHA verification failed.';
    }
  }
}

if (!empty($errors)) { fail_with_errors($errors); }

/* =======================
   COMPOSE MESSAGE (EST + bold labels)
   ======================= */
   $fullName = trim($first . ' ' . $last);
   $subject  = "New Contact Form Submission — {$fullName}";
   
   // Eastern Time
   $tz  = new DateTimeZone('America/New_York');
   $now = new DateTime('now', $tz);
   $timeReadable = $now->format('l, F j, Y • g:i A T'); // e.g. Wednesday, November 5, 2025 • 4:25 PM EST
   
   // HTML body with bold labels
   $htmlBody = "
     <h2 style='font-family:Arial,sans-serif;color:#333;margin:0 0 8px;'>New Contact Form Submission</h2>
     <p style='margin:4px 0;'><strong>Time:</strong> " . htmlspecialchars($timeReadable) . "</p>
     <p style='margin:4px 0;'><strong>Name:</strong> " . htmlspecialchars($fullName) . "</p>
     <p style='margin:4px 0;'><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
     <p style='margin:4px 0;'><strong>Phone:</strong> " . htmlspecialchars($phone) . "</p>
     <p style='margin:4px 0;'><strong>Title:</strong> " . htmlspecialchars($title ?: '—') . "</p>
     <p style='margin:4px 0;'><strong>Company:</strong> " . htmlspecialchars($company) . "</p>
     <p style='margin:4px 0;'><strong>Referrer:</strong> " . htmlspecialchars($ref ?: '—') . "</p>
     <p style='margin:4px 0;'><strong>Consent:</strong> Yes</p>
     <hr style='border:0;border-top:1px solid #ddd; margin:8px 0;'>
     <p style='margin:4px 0;'><strong>Message:</strong><br>" . nl2br(htmlspecialchars($help)) . "</p>
     <hr style='border:0;border-top:1px solid #ddd; margin:8px 0;'>
     <p style='color:#777;font-size:0.9rem;margin:4px 0;'>Sent from the contact form on thegforce.com</p>
   ";
   
   // Plaintext fallback (no bold)
   $plainBody = "New Contact Form Submission\n"
     . "Time: $timeReadable\n"
     . "Name: $fullName\n"
     . "Email: $email\n"
     . "Phone: $phone\n"
     . "Title: " . ($title ?: '—') . "\n"
     . "Company: $company\n"
     . "Referrer: " . ($ref ?: '—') . "\n"
     . "Consent: Yes\n"
     . "----\nMessage:\n$help\n";
   
/* =======================
   SEND VIA PHP mail()
   ======================= */
$headers  = "From: GForce Website <info@thegforce.com>\r\n";
if ($email) $headers .= "Reply-To: $fullName <$email>\r\n";
if (defined('BCC_EMAIL') && BCC_EMAIL) $headers .= "Bcc: " . BCC_EMAIL . "\r\n";
$headers .= "X-Website: thegforce.com\r\n";
$headers .= "X-Form: Contact\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

/* Critical on GoDaddy: set envelope sender */
$extraParams = "-f info@thegforce.com";

$ok = @mail(TO_EMAIL, $subject, $htmlBody, $headers, $extraParams);

if (!$ok) {
  error_log('mail() failed to send contact form (with -f).');
  echo '<!doctype html><html><head><meta charset="utf-8"><title>Send Error</title></head><body>';
  echo '<h1>We could not send your message right now.</h1>';
  echo '<p>Please email us directly at <a href="mailto:info@thegforce.com">info@thegforce.com</a>.</p>';
  echo '</body></html>';
  exit;
}

header('Location: ' . THANK_YOU_URL);
exit;

