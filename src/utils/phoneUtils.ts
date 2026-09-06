/**
 * Phone and WhatsApp utility functions for school communications
 */

export function cleanPhoneForWhatsApp(phoneStr?: string): string {
  if (!phoneStr) return '';

  // Convert Arabic-Indic digits (٠-٩) to ASCII (0-9)
  let clean = phoneStr
    .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/\D/g, '');

  if (!clean) return '';

  // Format to 9665XXXXXXXX
  if (clean.startsWith('00966')) {
    clean = clean.substring(2);
  } else if (clean.startsWith('05')) {
    clean = '966' + clean.substring(1);
  } else if (clean.startsWith('5') && clean.length === 9) {
    clean = '966' + clean;
  } else if (clean.startsWith('9665')) {
    // Already in correct format
  }

  return clean;
}

export function formatPhoneDisplay(phoneStr?: string): string {
  if (!phoneStr) return 'غير متوفر';

  // Convert Arabic-indic
  let clean = phoneStr
    .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .replace(/\D/g, '');

  if (clean.startsWith('966') && clean.length >= 12) {
    clean = '0' + clean.substring(3);
  } else if (clean.startsWith('5') && clean.length === 9) {
    clean = '0' + clean;
  }

  if (clean.length === 10 && clean.startsWith('05')) {
    // Format as 05x xxx xxxx
    return `${clean.substring(0, 3)} ${clean.substring(3, 6)} ${clean.substring(6)}`;
  }

  return clean || phoneStr;
}

export function createWhatsAppOfficialMessage(params: {
  studentName: string;
  className?: string;
  problemDesc: string;
  degree: string;
  procedures?: string[];
  dateStr?: string;
}): string {
  const { studentName, className, problemDesc, degree, procedures = [], dateStr } = params;
  const today = dateStr || new Date().toLocaleDateString('ar-SA');
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[new Date().getDay()];

  const procsText = procedures.length > 0
    ? procedures.map((p) => `• ${p}`).join('\n')
    : '• تم استدعاء الطالب وتوجيهه تربوياً وأخذ تعهد بعدم التكرار';

  return `السلام عليكم ورحمة الله وبركاته
المكرم ولي أمر الطالب / ${studentName} المحترم ${className ? `(الصف: ${className})` : ''}

نفيدكم بأنه تم تسجيل ملاحظة سلوكية على ابنكم:
📌 المشكلة: *${problemDesc}*
📊 التصنيف: *${degree}*

وقد تم اتخاذ الإجراءات التربوية والعلاجية التالية:
${procsText}

تاريخ التسجيل: ${dayName} ${today}

نرجو من سعادتكم التكرم بمتابعة ابنكم والتعاون المشترك مع المدرسة لما فيه مصلحته التربوية والتعليمية.
شاكرين ومقدرين حسن تعاونكم وحرصكم الدائم.

*مدرسة الجشة المتوسطة*
*الموجه الطلابي: عبدالهادي بن محمد المحسن*`;
}

export function openWhatsAppChat(phoneStr: string, message: string): void {
  const cleanPhone = cleanPhoneForWhatsApp(phoneStr);
  const encoded = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
