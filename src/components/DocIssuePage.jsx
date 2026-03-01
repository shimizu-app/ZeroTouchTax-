import React, { useState, useRef } from "react";
import { C, hd, bd, mono } from "../lib/theme";
import { Rv, Mag, Card3, PageShell } from "./ui";

function DocIssuePage() {
  const [activeCat, setActiveCat] = useState("取引");
  const [activeDoc, setActiveDoc] = useState(null);
  const [editData, setEditData] = useState({});
  const [issued, setIssued] = useState([
    { id:"ISS-001", type:"請求書", partner:"AWS Japan", amount:248000, date:"2026/02/18", status:"送付済" },
    { id:"ISS-002", type:"見積書", partner:"山田商事", amount:1500000, date:"2026/02/15", status:"下書き" },
    { id:"ISS-003", type:"領収書", partner:"スターバックス", amount:1200, date:"2026/02/18", status:"発行済" },
  ]);
  const [tab, setTab] = useState("templates");
  const [aiOpen, setAiOpen] = useState(true);
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState([]);

  /* Per-document AI recommendations */
  const aiRecommendations = {
    invoice: [
      { l:"支払期限を追加", d:"末締め翌月末払いの支払条件を記載" },
      { l:"振込手数料の負担先を明記", d:"「振込手数料はご負担ください」を追加" },
      { l:"遅延損害金の条項を追加", d:"年14.6%の遅延損害金条項を挿入" },
      { l:"インボイス番号を確認", d:"適格請求書の要件をチェック" },
    ],
    estimate: [
      { l:"有効期限を設定", d:"発行日から30日間の有効期限を追記" },
      { l:"別途費用の注記を追加", d:"交通費・宿泊費等の実費精算条件" },
      { l:"納期の目安を記載", d:"契約締結後の作業期間を明示" },
      { l:"前提条件を追記", d:"見積もりの前提となる条件を備考に記載" },
    ],
    delivery: [
      { l:"検収条件を明記", d:"納品後7営業日以内の検収期間を追記" },
      { l:"保証条件を追加", d:"納品物の保証期間と範囲を記載" },
    ],
    receipt: [
      { l:"但し書きを追加", d:"「品代として」等の但し書きを記載" },
      { l:"収入印紙の確認", d:"5万円以上の場合は印紙税が必要です" },
    ],
    order: [
      { l:"納期を指定", d:"希望納品日を明記" },
      { l:"検収基準を記載", d:"受入検査の基準と不合格時の対応" },
    ],
    serviceContract: [
      { l:"知的財産権の帰属条項を追加", d:"成果物の著作権・特許権の帰属先を明確化" },
      { l:"再委託の条件を追加", d:"乙の再委託を認めるか、条件を設定" },
      { l:"契約解除条項を追加", d:"中途解約の条件と清算方法を規定" },
      { l:"反社会的勢力排除条項を追加", d:"コンプライアンス上の必須条項" },
      { l:"準拠法・管轄裁判所を追加", d:"日本法準拠、東京地裁管轄を明記" },
    ],
    nda: [
      { l:"秘密情報の例外規定を追加", d:"公知情報・独自開発情報の除外を明記" },
      { l:"開示範囲の制限を追加", d:"need-to-know原則に基づく開示制限" },
      { l:"残存条項を追加", d:"契約終了後も存続する義務の範囲を明確化" },
      { l:"差止請求の条項を追加", d:"違反時の差止・仮処分の権利を規定" },
    ],
    salesContract: [
      { l:"所有権移転時期を明記", d:"代金完済時に所有権が移転する旨を追加" },
      { l:"危険負担の条項を追加", d:"引渡前後の滅失・毀損リスクの負担先" },
      { l:"返品条件を追加", d:"返品・交換の条件と期限を規定" },
    ],
    leaseContract: [
      { l:"更新条件を追加", d:"自動更新の条件と賃料改定の取り決め" },
      { l:"禁止事項を追加", d:"転貸、用途変更、改装等の禁止事項" },
      { l:"退去時の精算条項を追加", d:"敷金返還と原状回復費用の精算方法" },
    ],
    coverLetter: [
      { l:"送付書類一覧を確認", d:"同封書類の抜け漏れがないか確認" },
      { l:"返送期限を追記", d:"署名済み書類の返送期限を明記" },
    ],
    greeting: [
      { l:"移転案内の文例に変更", d:"本社移転のお知らせ文面に切替" },
      { l:"年始挨拶の文例に変更", d:"新年のご挨拶文面に切替" },
      { l:"設立記念の文例に変更", d:"創業○周年の挨拶文面に切替" },
    ],
    thankYou: [
      { l:"打合せお礼の文例に変更", d:"会議・面談後のお礼文面" },
      { l:"受注お礼に変更", d:"ご発注への感謝と今後の進め方" },
      { l:"紹介お礼に変更", d:"ご紹介いただいた方へのお礼" },
    ],
    reminder: [
      { l:"2回目の督促文に変更", d:"より強い表現の再督促文面" },
      { l:"法的措置の予告を追加", d:"期限内に支払いなき場合の対応を明記" },
    ],
    travelExp: [
      { l:"定期区間を控除", d:"通勤定期区間の重複を自動差し引き" },
    ],
    expense: [
      { l:"承認フローを確認", d:"必要な承認者を追記" },
    ],
  };

  /* ── SVG Icon components ── */
  const DI = ({ d, sz=20, c="currentColor" }) => <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
  const icons = {
    invoice:     (c) => <DI d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15h6" c={c}/>,
    estimate:    (c) => <DI d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" c={c}/>,
    delivery:    (c) => <DI d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" c={c}/>,
    receipt:     (c) => <DI d="M4 2v20l3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2zM8 10h8M8 14h4" c={c}/>,
    order:       (c) => <DI d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4" c={c}/>,
    orderAck:    (c) => <DI d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" c={c}/>,
    payNotice:   (c) => <DI d="M21 12V7H5a2 2 0 010-4h14v4M3 5v14a2 2 0 002 2h16v-5M18 12a2 2 0 000 4h4v-4z" c={c}/>,
    depositConf: (c) => <DI d="M22 2l-7 20-4-9-9-4zM22 2L11 13" c={c}/>,
    reminder:    (c) => <DI d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" c={c}/>,
    expense:     (c) => <DI d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" c={c}/>,
    serviceContract: (c) => <DI d="M20 7h-9M14 17H5M17 17l2 2 4-4M3 7l2 2 4-4" c={c}/>,
    nda:         (c) => <DI d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4M12 15v2" c={c}/>,
    salesContract: (c) => <DI d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" c={c}/>,
    leaseContract: (c) => <DI d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" c={c}/>,
    withdrawSlip:(c) => <DI d="M12 5v14M5 12l7 7 7-7" c={c}/>,
    depositSlip: (c) => <DI d="M12 19V5M5 12l7-7 7 7" c={c}/>,
    transferSlip:(c) => <DI d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" c={c}/>,
    travelExp:   (c) => <DI d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" c={c}/>,
    advanceExp:  (c) => <DI d="M19 5h-7L8 1 4 5h-.5a2.5 2.5 0 000 5H6l-3 8h2l1-3h10l1 3h2l-3-8h2.5a2.5 2.5 0 000-5z" c={c}/>,
    coverLetter: (c) => <DI d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" c={c}/>,
    greeting:    (c) => <DI d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" c={c}/>,
    thankYou:    (c) => <DI d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a5 5 0 11-.001 10.001A5 5 0 0112 3zM16 3.13a4 4 0 010 7.75" c={c}/>,
  };

  /* ── Per-document-type field config ── */
  const docFieldConfig = {
    invoice:     { hasPartnerAddr:true, hasDueDate:true, hasBank:true, hasItems:true, hasStamp:true },
    estimate:    { hasPartnerAddr:true, hasValidity:true, hasItems:true, hasNote:true },
    delivery:    { hasPartnerAddr:true, hasItems:true },
    receipt:     { hasPartnerAddr:false, hasItems:true, hasPayMethod:true, hasStamp:true },
    order:       { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasDeliveryAddr:true },
    orderAck:    { hasPartnerAddr:true, hasDueDate:true, hasItems:true },
    payNotice:   { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasBank:true },
    depositConf: { hasPartnerAddr:true, hasAmount:true, hasBank:true, hasBody:true },
    reminder:    { hasPartnerAddr:true, hasDueDate:true, hasItems:true, hasBank:true, hasNote:true },
    expense:     { hasItems:true, hasApprover:true },
    serviceContract: { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    nda:         { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    salesContract:   { hasPartnerAddr:true, hasDueDate:true, hasClauses:true, hasStamp:true },
    leaseContract:   { hasPartnerAddr:true, hasContractPeriod:true, hasClauses:true, hasStamp:true },
    withdrawSlip:    { hasSlipFields:true, hasApprover:true },
    depositSlip:     { hasSlipFields:true, hasApprover:true },
    transferSlip:    { hasSlipFields:true, hasApprover:true },
    travelExp:   { hasTravelRows:true, hasApprover:true },
    advanceExp:  { hasItems:true, hasApprover:true },
    coverLetter: { hasPartnerAddr:true, hasBody:true, hasEnclosures:true },
    greeting:    { hasPartnerAddr:true, hasBody:true },
    thankYou:    { hasPartnerAddr:true, hasBody:true },
  };

  const templates = [
    { cat:"取引", items:[
      { id:"invoice", name:"請求書", desc:"取引先への代金請求" },
      { id:"estimate", name:"見積書", desc:"取引条件の事前提示" },
      { id:"delivery", name:"納品書", desc:"商品・サービスの納品確認" },
      { id:"receipt", name:"領収書", desc:"代金受領の証明" },
      { id:"order", name:"注文書（発注書）", desc:"商品・サービスの発注" },
      { id:"orderAck", name:"注文請書", desc:"受注確認の書面" },
    ]},
    { cat:"入出金", items:[
      { id:"payNotice", name:"支払通知書", desc:"支払い予定の通知" },
      { id:"depositConf", name:"入金確認書", desc:"入金確認の通知" },
      { id:"reminder", name:"督促状", desc:"未払い代金の催促" },
      { id:"expense", name:"精算書", desc:"経費の精算申請" },
    ]},
    { cat:"契約", items:[
      { id:"serviceContract", name:"業務委託契約書", desc:"業務委託の契約条件" },
      { id:"nda", name:"秘密保持契約書", desc:"機密情報の取扱い" },
      { id:"salesContract", name:"売買契約書", desc:"売買取引の契約" },
      { id:"leaseContract", name:"賃貸借契約書", desc:"賃貸物件の契約" },
    ]},
    { cat:"社内・経理", items:[
      { id:"withdrawSlip", name:"出金伝票", desc:"現金支出の記録" },
      { id:"depositSlip", name:"入金伝票", desc:"現金収入の記録" },
      { id:"transferSlip", name:"振替伝票", desc:"振替取引の記録" },
      { id:"travelExp", name:"交通費精算書", desc:"交通費の精算" },
      { id:"advanceExp", name:"立替金精算書", desc:"立替払いの精算" },
    ]},
    { cat:"対外", items:[
      { id:"coverLetter", name:"送付状", desc:"書類送付の案内" },
      { id:"greeting", name:"挨拶状", desc:"取引先への挨拶" },
      { id:"thankYou", name:"お礼状", desc:"取引先へのお礼" },
    ]},
  ];

  const allItems = templates.flatMap(c => c.items);

  const openPreview = (docId) => {
    setActiveDoc(docId);
    const cfg = docFieldConfig[docId] || {};
    const tpl = allItems.find(x=>x.id===docId);
    const base = {
      title: tpl?.name || "書類", num: "DOC-2026-001", issueDate: "2026/02/25",
      partner: "", partnerAddr: "", partnerTel: "",
      issuerName: "クライアント名", issuerAddr: "住所未設定",
      issuerTel: "未設定", issuerEmail: "info@technova.co.jp", invoiceNum: "T1234567890123",
      rows: [], clauses: [], travelRows: [], slipEntries: [], enclosures: [],
      note: "", body: "", dueDate: "", validity: "", payMethod: "",
      bankName: "三菱UFJ銀行 渋谷支店", bankAccount: "普通 1234567", bankHolder: "カ）クライアント名",
      approver: "", contractStart: "", contractEnd: "", deliveryAddr: "", singleAmount: 0,
    };
    /* Per-type sample content */
    const samples = {
      invoice: { rows:[{ item:"Webサイト制作（トップ+下層5P）", qty:1, unit:"式", price:500000 },{ item:"レスポンシブ対応", qty:1, unit:"式", price:80000 },{ item:"ロゴデザイン・ブランディング", qty:1, unit:"式", price:150000 },{ item:"SEO初期設定・Google Analytics導入", qty:1, unit:"式", price:50000 },{ item:"月額保守・運用サポート（3月分）", qty:1, unit:"月", price:50000 }], dueDate:"2026/03/31", bank:"銀行口座未設定", note:"お支払期限：2026年3月31日\n振込手数料はお客様ご負担にてお願いいたします。\n適格請求書発行事業者登録番号：T1234567890123" },
      estimate: { rows:[{ item:"要件定義・基本設計", qty:10, unit:"人日", price:60000 },{ item:"フロントエンド開発（React）", qty:30, unit:"人日", price:55000 },{ item:"バックエンド開発（Node.js）", qty:25, unit:"人日", price:55000 },{ item:"データベース設計・構築", qty:5, unit:"人日", price:60000 },{ item:"テスト・品質管理", qty:15, unit:"人日", price:50000 },{ item:"サーバー構築・デプロイ", qty:5, unit:"人日", price:55000 },{ item:"プロジェクト管理費", qty:1, unit:"式", price:300000 }], validity:"発行日より30日間有効", note:"【前提条件】\n・ご契約後のキックオフから約3ヶ月での納品を想定\n・お客様側のレビュー・フィードバック期間を含む\n・サーバー費用（AWS等）は別途実費精算\n・追加要件が発生した場合は別途お見積り\n\n【お支払条件】\n・着手金：契約締結時に30%\n・中間金：中間納品時に30%\n・残金：最終納品・検収後に40%" },
      delivery: { rows:[{ item:"Webサイト制作一式（HTML/CSS/JS）", qty:1, unit:"式", price:500000 },{ item:"デザインデータ（Figma/PSD）", qty:1, unit:"式", price:150000 },{ item:"ロゴデータ（AI/SVG/PNG）", qty:1, unit:"式", price:0 },{ item:"操作マニュアル", qty:1, unit:"部", price:0 }], note:"【検収について】\n・検収期間：納品日から7営業日以内\n・上記期間内にご連絡がない場合、検収完了とさせていただきます。\n\n【納品物一覧】\n・Webサイト本体（本番環境へのデプロイ済み）\n・ソースコード一式（GitHub リポジトリ）\n・デザインデータ（Figma共有リンク）\n・操作マニュアル（PDF）" },
      receipt: { rows:[{ item:"コンサルティング費用（2月分）", qty:1, unit:"式", price:110000 }], payMethod:"銀行振込", note:"上記の金額を正に領収いたしました。\n\n収入印紙：非課税（5万円未満の場合）\n※ 本領収書は電子発行につき、印紙税法上の課税対象外です。" },
      order: { rows:[{ item:"ノートPC（ThinkPad X1 Carbon Gen11）", qty:5, unit:"台", price:198000 },{ item:"外付けモニター 27インチ 4K", qty:5, unit:"台", price:45000 },{ item:"USB-C ドッキングステーション", qty:5, unit:"個", price:12800 },{ item:"ワイヤレスキーボード・マウスセット", qty:5, unit:"セット", price:8900 }], deliveryAddr:"住所未設定 クライアント名本社 総務部宛", deliveryDate:"2026/03/15", note:"納品は平日9:00〜17:00にお願いいたします。\n搬入時は事前に担当（総務部 佐藤 TEL: 未設定）までご連絡ください。" },
      orderAck: { rows:[{ item:"ノートPC（ThinkPad X1 Carbon Gen11）", qty:5, unit:"台", price:198000 },{ item:"外付けモニター 27インチ 4K", qty:5, unit:"台", price:45000 },{ item:"USB-C ドッキングステーション", qty:5, unit:"個", price:12800 },{ item:"ワイヤレスキーボード・マウスセット", qty:5, unit:"セット", price:8900 }], deliveryDate:"2026/03/15", note:"ご注文いただき誠にありがとうございます。\n上記の通り承りましたので、ご確認くださいますようお願い申し上げます。\nお届け予定日：2026年3月15日（月）\nお支払条件：納品月末締め翌月末払い" },
      payNotice: { rows:[{ item:"システム開発費（2月分）", qty:1, unit:"式", price:800000 },{ item:"サーバー保守費（2月分）", qty:1, unit:"式", price:55000 }], dueDate:"2026/03/31", bank:"銀行口座未設定", note:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n\n下記の通りお支払いさせていただきますので、ご確認くださいますようお願い申し上げます。\n\nお支払方法：銀行振込\nお支払予定日：2026年3月31日\n\n※ 振込手数料は弊社にて負担いたします。\n\n敬具" },
      depositConf: { singleAmount:770000, body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\n下記のとおり入金を確認いたしましたので、ご通知申し上げます。\n\n【入金明細】\n入金日：2026年2月20日\n入金額：¥770,000\n摘　要：Webサイト制作費用\n請求書番号：INV-2026-012\nお振込元：山田商事株式会社 様\n\n引き続きお取引のほど、何卒よろしくお願い申し上げます。\n\n敬具" },
      reminder: { rows:[{ item:"Webサイト制作費用", qty:1, unit:"式", price:770000 }], dueDate:"2026/01/31", note:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n\nさて、下記の通りお支払い期日を過ぎた未入金がございますので、ご確認のうえ至急のお手続きをお願い申し上げます。\n\n請求書番号：INV-2026-012\nお支払期限：2026年1月31日\n\n既にお支払い済みの場合は、本状と行き違いとなりますことをご容赦ください。\nご不明な点がございましたら、下記連絡先までお問い合わせください。\n\n敬具" },
      expense: { rows:[{ item:"交通費（タクシー）渋谷→品川 客先訪問", qty:1, unit:"回", price:4200 },{ item:"会食費（接待）鈴木部長 和食○○", qty:1, unit:"回", price:32400 },{ item:"文具・備品（コピー用紙・トナー）", qty:1, unit:"式", price:5800 },{ item:"書籍代（税法改正対応ハンドブック）", qty:2, unit:"冊", price:3300 },{ item:"会議室利用料（○○コワーキング）", qty:1, unit:"回", price:5500 },{ item:"宅配便（契約書送付 山田商事宛）", qty:1, unit:"回", price:1200 }], approver:"田中部長", note:"※ 領収書はすべて原本を添付しております。\n※ 接待費は事前に田中部長の承認済みです（承認番号: AP-2026-045）。" },
      serviceContract: { clauses:[
        { title:"第1条（委託業務の内容）", text:"甲は乙に対し、以下の業務（以下「本業務」という）を委託し、乙はこれを受託する。\n\n① Webアプリケーション開発業務\n② システム設計・テスト業務\n③ 運用保守業務\n④ 上記に付随する一切の業務\n\n業務の詳細は、別紙仕様書に定める。" },
        { title:"第2条（委託料及び支払方法）", text:"1. 委託料は月額 金○○万円（消費税別）とする。\n2. 乙は毎月末日締めにて請求書を甲に発行するものとする。\n3. 甲は請求書受領後、翌月末日までに乙の指定する銀行口座へ振込にて支払うものとする。\n4. 振込手数料は甲の負担とする。" },
        { title:"第3条（契約期間）", text:"1. 本契約の有効期間は、令和○年○月○日から令和○年○月○日までとする。\n2. 期間満了の1ヶ月前までに甲乙いずれからも書面による解約の申し出がない場合は、同一条件にて1年間自動更新されるものとし、以後も同様とする。" },
        { title:"第4条（再委託の禁止）", text:"乙は、甲の書面による事前の承諾を得ることなく、本業務の全部又は一部を第三者に再委託してはならない。" },
        { title:"第5条（秘密保持）", text:"1. 甲及び乙は、本契約に関連して知り得た相手方の技術上・営業上その他の秘密情報を、相手方の書面による事前の承諾なく第三者に開示又は漏洩してはならない。\n2. 前項の義務は、本契約終了後3年間存続するものとする。" },
        { title:"第6条（知的財産権）", text:"1. 本業務に基づき乙が作成した成果物の著作権（著作権法第27条及び第28条の権利を含む）は、委託料の完済をもって甲に帰属するものとする。\n2. 乙は、甲に対し著作者人格権を行使しないものとする。" },
        { title:"第7条（損害賠償）", text:"甲又は乙が本契約に違反し、相手方に損害を与えた場合、違反当事者は相手方に対しその直接かつ現実に生じた損害を賠償する責任を負う。ただし、賠償額の上限は、当該損害の原因となった個別契約の委託料の総額とする。" },
        { title:"第8条（解除）", text:"甲又は乙は、相手方が以下の各号のいずれかに該当した場合、何らの催告なく直ちに本契約を解除することができる。\n① 本契約に重大な違反をし、催告後14日以内に是正しないとき\n② 支払停止又は支払不能に陥ったとき\n③ 破産、民事再生、会社更生又は特別清算の申立てがあったとき" },
        { title:"第9条（反社会的勢力の排除）", text:"甲及び乙は、自ら又はその役員等が反社会的勢力に該当しないことを表明・保証し、将来にわたっても該当しないことを確約する。" },
        { title:"第10条（協議事項）", text:"本契約に定めのない事項又は本契約の解釈に疑義が生じた場合は、甲乙誠意をもって協議し、円満に解決するものとする。" },
        { title:"第11条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/04/01", contractEnd:"2027/03/31" },
      nda: { clauses:[
        { title:"第1条（秘密情報の定義）", text:"1. 本契約における「秘密情報」とは、開示当事者が受領当事者に対し、書面、口頭、電子的手段その他の方法により開示する技術上、営業上、その他事業に関する一切の情報をいう。\n2. ただし、以下の各号に該当する情報は秘密情報に含まないものとする。\n  ① 開示の時点で既に公知であったもの\n  ② 開示後、受領当事者の責によらず公知となったもの\n  ③ 開示の時点で受領当事者が既に保有していたもの\n  ④ 受領当事者が第三者から秘密保持義務を負うことなく適法に取得したもの\n  ⑤ 受領当事者が秘密情報を利用することなく独自に開発したもの" },
        { title:"第2条（秘密保持義務）", text:"1. 受領当事者は、秘密情報を善良な管理者の注意をもって管理し、開示当事者の書面による事前の承諾なく第三者に開示又は漏洩してはならない。\n2. 受領当事者は、秘密情報へのアクセスを、本契約の目的のために知る必要のある自己の役員及び従業員に限定するものとする。" },
        { title:"第3条（目的外使用の禁止）", text:"受領当事者は、秘密情報を本契約の目的（以下「本目的」という）以外に使用してはならない。" },
        { title:"第4条（複製の制限）", text:"受領当事者は、本目的のために合理的に必要な範囲を超えて秘密情報を複製してはならない。" },
        { title:"第5条（秘密情報の返還・廃棄）", text:"1. 本契約が終了した場合、又は開示当事者から要求があった場合、受領当事者は秘密情報及びその複製物を速やかに返還又は廃棄しなければならない。\n2. 廃棄した場合、受領当事者は廃棄した旨の証明書を開示当事者に提出するものとする。" },
        { title:"第6条（有効期間）", text:"1. 本契約の有効期間は、締結日から3年間とする。\n2. 秘密保持義務は、本契約終了後もなお5年間存続するものとする。" },
        { title:"第7条（損害賠償）", text:"本契約に違反して秘密情報を漏洩又は目的外使用した場合、違反当事者は相手方に生じた一切の損害（弁護士費用を含む）を賠償する責任を負う。" },
        { title:"第8条（差止請求）", text:"秘密情報の漏洩又は目的外使用のおそれがある場合、開示当事者は受領当事者に対し、当該行為の差止めを請求することができる。" },
        { title:"第9条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/02/25", contractEnd:"2029/02/24" },
      salesContract: { clauses:[
        { title:"第1条（目的）", text:"甲は乙に対し、別紙に定める商品（以下「本商品」という）を売り渡し、乙はこれを買い受けるものとする。" },
        { title:"第2条（売買代金及び支払方法）", text:"1. 売買代金は金○○円（消費税別）とする。\n2. 乙は、本契約締結後○営業日以内に、甲の指定する銀行口座へ振込にて全額を支払うものとする。\n3. 振込手数料は乙の負担とする。" },
        { title:"第3条（引渡し）", text:"1. 甲は、代金全額の受領を確認した後、○営業日以内に本商品を乙の指定場所へ引き渡すものとする。\n2. 引渡しに要する運送費用は甲の負担とする。\n3. 本商品の滅失・毀損等の危険は、引渡しの完了をもって甲から乙に移転するものとする。" },
        { title:"第4条（所有権の移転）", text:"本商品の所有権は、売買代金の全額支払いが完了した時点で甲から乙に移転するものとする。" },
        { title:"第5条（検収）", text:"1. 乙は、本商品の受領後○営業日以内に検収を行い、その結果を甲に通知するものとする。\n2. 当該期間内に通知がない場合は、検収に合格したものとみなす。\n3. 検収不合格の場合、甲は速やかに代替品の納入又は修補を行うものとする。" },
        { title:"第6条（契約不適合責任）", text:"1. 引渡後○ヶ月以内に本商品に種類、品質又は数量に関して契約の内容に適合しない箇所（以下「契約不適合」という）が発見された場合、甲は無償にて修補、代替品の引渡し、又は代金の減額を行うものとする。\n2. 乙は、契約不適合を知った時から1年以内にその旨を甲に通知しなければならない。" },
        { title:"第7条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ] },
      leaseContract: { clauses:[
        { title:"第1条（賃貸物件）", text:"甲は乙に対し、下記の物件（以下「本物件」という）を賃貸し、乙はこれを賃借する。\n\n所在地：東京都○○区○○丁目○番○号\n建物名：○○ビル ○階\n面　積：○○.○○㎡\n用　途：事務所" },
        { title:"第2条（賃貸借期間）", text:"1. 賃貸借期間は令和○年○月○日から令和○年○月○日までの○年間とする。\n2. 甲又は乙は、期間満了の6ヶ月前までに書面にて相手方に通知することにより、本契約の更新を拒絶することができる。\n3. 前項の通知がない場合、本契約は同一条件にて2年間更新されるものとする。" },
        { title:"第3条（賃料及び支払方法）", text:"1. 賃料は月額 金○○万円（消費税別）とする。\n2. 乙は毎月末日までに翌月分の賃料を甲の指定する銀行口座へ振込にて支払うものとする。\n3. 振込手数料は乙の負担とする。\n4. 賃料の改定は、経済情勢の変動等を考慮し、甲乙協議のうえ決定する。" },
        { title:"第4条（敷金）", text:"1. 乙は本契約締結時に、敷金として賃料の○ヶ月分に相当する金○○万円を甲に預託する。\n2. 甲は本契約終了後、乙の未払債務を控除した残額を、本物件の明渡し完了後30日以内に返還するものとする。" },
        { title:"第5条（禁止事項）", text:"乙は、甲の書面による事前の承諾なく、以下の行為をしてはならない。\n① 本物件の全部又は一部の転貸\n② 賃借権の譲渡\n③ 本物件の増改築、模様替え又は造作の設置\n④ 用途の変更" },
        { title:"第6条（修繕）", text:"1. 本物件の構造躯体及び主要設備の修繕は甲の負担とする。\n2. 乙の使用に起因する修繕は乙の負担とする。" },
        { title:"第7条（原状回復及び明渡し）", text:"1. 乙は本契約終了時に、通常の使用による損耗及び経年劣化を除き、本物件を原状に回復して甲に明け渡さなければならない。\n2. 原状回復の範囲及び費用については、国土交通省のガイドラインに準拠するものとする。" },
        { title:"第8条（準拠法及び管轄裁判所）", text:"本契約は日本法を準拠法とし、本契約に関する一切の紛争については、本物件所在地を管轄する地方裁判所を第一審の専属的合意管轄裁判所とする。" },
      ], contractStart:"2026/04/01", contractEnd:"2028/03/31" },
      withdrawSlip: { slipEntries:[{ date:"2026/02/25", account:"消耗品費", partner:"文具堂渋谷店", amount:3500, memo:"コピー用紙A4 5箱" },{ date:"2026/02/25", account:"通信費", partner:"NTT東日本", amount:8800, memo:"電話回線使用料2月分" },{ date:"2026/02/25", account:"新聞図書費", partner:"丸善ジュンク堂", amount:6600, memo:"税務専門書2冊" }] },
      depositSlip: { slipEntries:[{ date:"2026/02/25", account:"売上", partner:"山田商事株式会社", amount:550000, memo:"Web制作費入金（INV-2026-010）" },{ date:"2026/02/25", account:"売上", partner:"鈴木工業株式会社", amount:330000, memo:"コンサルティング費入金（INV-2026-011）" }] },
      transferSlip: { slipEntries:[{ date:"2026/02/25", debitAcc:"未払金", creditAcc:"普通預金", amount:380000, memo:"事務所家賃3月分" },{ date:"2026/02/25", debitAcc:"前払費用", creditAcc:"普通預金", amount:120000, memo:"保険料年払い按分" }] },
      travelExp: { travelRows:[
        { date:"2026/02/18", from:"渋谷", to:"新宿", transport:"JR山手線", amount:200, memo:"山田商事 定例打合せ" },
        { date:"2026/02/18", from:"新宿", to:"品川", transport:"JR山手線", amount:200, memo:"鈴木工業 現地調査" },
        { date:"2026/02/18", from:"品川", to:"渋谷", transport:"JR山手線", amount:200, memo:"帰社" },
        { date:"2026/02/19", from:"渋谷", to:"東京", transport:"JR山手線", amount:200, memo:"税理士会セミナー参加" },
        { date:"2026/02/19", from:"東京", to:"渋谷", transport:"JR山手線", amount:200, memo:"帰社" },
        { date:"2026/02/20", from:"渋谷", to:"六本木", transport:"東京メトロ日比谷線", amount:180, memo:"新規顧客 面談" },
        { date:"2026/02/20", from:"六本木", to:"渋谷", transport:"東京メトロ日比谷線", amount:180, memo:"帰社" },
        { date:"2026/02/21", from:"渋谷", to:"横浜", transport:"東急東横線", amount:280, memo:"佐藤製作所 決算打合せ" },
        { date:"2026/02/21", from:"横浜", to:"渋谷", transport:"東急東横線", amount:280, memo:"帰社" },
      ], approver:"田中部長", note:"※ 通勤定期区間（渋谷〜恵比寿）は控除済みです。\n※ 2/21 横浜出張は事前申請済み（出張申請番号: TR-2026-018）。" },
      advanceExp: { rows:[{ item:"打合せ用 飲料・軽食代", qty:1, unit:"式", price:2400 },{ item:"タクシー代（雨天・書類搬送）", qty:1, unit:"回", price:3200 },{ item:"駐車場代（客先訪問時）", qty:2, unit:"回", price:1600 },{ item:"コンビニ印刷（緊急資料）", qty:1, unit:"回", price:480 }], approver:"田中部長", note:"※ 仮払金は2026年2月28日までに精算いたします。" },
      coverLetter: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、下記の書類をお送りいたしますので、ご査収くださいますようお願い申し上げます。\n\nなお、ご確認の上、同封の控えに受領印を押印いただき、同封の返信用封筒にてご返送くださいますようお願い申し上げます。\n\nご不明な点がございましたら、担当（佐藤 TEL: 未設定）までお気軽にお問い合わせください。\n\n今後とも何卒よろしくお願い申し上げます。\n\n敬具", enclosures:["業務委託契約書（正本・副本）  各1通","請求書  1通","納品書  1通","返信用封筒  1通"] },
      greeting: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、この度弊社は業務拡大に伴い、下記の通り本社を移転する運びとなりましたので、ご案内申し上げます。\n\n【移転日】\n令和8年4月1日（水）\n\n【新住所】\n〒150-0001\n住所未設定 クライアント名ビル\nTEL: 未設定（代表）\nFAX: 03-1234-5679\nE-mail: info@technova.co.jp\n\n【アクセス】\nJR山手線「原宿駅」竹下口より徒歩5分\n東京メトロ千代田線「明治神宮前駅」5番出口より徒歩3分\n\n新しいオフィスでは、より一層お客様のご期待に添えるよう、社員一同精進して参ります。\n今後とも変わらぬご支援ご愛顧を賜りますよう、何卒よろしくお願い申し上げます。\n\nまずは略儀ながら、書面にてご挨拶申し上げます。\n\n敬具" },
      thankYou: { body:"拝啓　時下ますますご清栄のこととお慶び申し上げます。\n平素は格別のご高配を賜り、厚く御礼申し上げます。\n\nさて、先日はお忙しい中、貴重なお時間をいただきまして、誠にありがとうございました。\n\nご面談の中で頂戴いたしましたご意見・ご要望につきましては、社内にて慎重に検討させていただいております。近日中に具体的なご提案をまとめた上で、改めてご連絡させていただきたく存じます。\n\nまた、ご提示いただいた資料につきましても、大変参考になりました。重ねて御礼申し上げます。\n\n今後とも末永いお付き合いをいただけますよう、何卒よろしくお願い申し上げます。\n\nまずは略儀ながら、書中をもってお礼申し上げます。\n\n敬具" },
    };
    setEditData({ ...base, ...samples[docId] });
  };

  /* recalc helper */
  const recalc = (rows) => {
    const subtotal = rows.reduce((s,r) => s + (Number(r.qty)||0) * (Number(r.price)||0), 0);
    return { subtotal, tax: Math.round(subtotal * 0.1), total: Math.round(subtotal * 1.1) };
  };

  const updateField = (key, val) => setEditData(p => ({ ...p, [key]: val }));
  const updateRow = (idx, key, val) => {
    setEditData(prev => {
      const rows = [...prev.rows];
      rows[idx] = { ...rows[idx], [key]: key==="item"||key==="unit" ? val : val };
      const calc = recalc(rows);
      return { ...prev, rows, ...calc };
    });
  };
  const addRow = () => setEditData(p => ({ ...p, rows: [...p.rows, { item:"", qty:1, unit:"式", price:0 }] }));
  const removeRow = (idx) => {
    setEditData(prev => {
      const rows = prev.rows.filter((_,i) => i !== idx);
      return { ...prev, rows, ...recalc(rows) };
    });
  };

  const fmt = n => "\u00A5" + (Number(n)||0).toLocaleString();
  const stColor = s => s==="送付済"?"#6BA3FF":s==="発行済"?"#7BE0A0":s==="下書き"?"#E8B84B":"#fff";

  /* ── Reusable edit field ── */
  const EF = ({ value, onChange, style:s, type, placeholder, ...rest }) => (
    <input type={type||"text"} value={value===0&&type==="number"?"":value??""}
      onChange={e => onChange(type==="number" ? (e.target.value===""?0:Number(e.target.value)) : e.target.value)}
      placeholder={placeholder||""}
      style={{ background:"transparent", border:"1px solid #e0e0e8", borderRadius:4, outline:"none",
        color:"#1a1a2e", fontFamily:bd, padding:"4px 6px", fontSize:12, boxSizing:"border-box", ...s }}
      onFocus={e=>{e.target.style.borderColor="#4466EE";e.target.style.background="rgba(68,102,238,.04)";}}
      onBlur={e=>{e.target.style.borderColor="#e0e0e8";e.target.style.background="transparent";}}
      {...rest} />
  );

  /* ── PREVIEW / EDIT MODE ── */
  if (activeDoc) {
    const d = editData;
    const cfg = docFieldConfig[activeDoc] || {};
    const calc = recalc(d.rows || []);
    const hasItemTable = cfg.hasItems && !cfg.hasBody && !cfg.hasClauses && !cfg.hasSlipFields && !cfg.hasTravelRows;

    return (
      <PageShell title="書類発行" watermark={"書類\n発行"}>
        <Rv><div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Mag onClick={()=>setActiveDoc(null)} s={{ padding:"6px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>← 戻る</Mag>
            <span style={{ fontSize:14, color:"#fff", fontWeight:600 }}>{d.title} — プレビュー・編集</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Mag s={{ padding:"8px 20px", borderRadius:14, border:`1.5px solid ${C.border}`, background:"transparent", color:C.textSec, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:bd }}>PDF出力</Mag>
            <Mag s={{ padding:"8px 20px", borderRadius:14, border:"none", background:"rgba(139,123,244,.15)", color:"#C4B8FF", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:bd, boxShadow:"0 0 18px rgba(139,123,244,.2)" }}>発行する</Mag>
          </div>
        </div></Rv>

        <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
        {/* ── Document preview (left) ── */}
        <div style={{ flex:1, minWidth:0 }}>
        <Rv d={10}><div style={{ background:"#fff", borderRadius:12, padding:"48px 56px", maxWidth:760, boxShadow:"0 8px 40px rgba(0,0,0,.4)", color:"#1a1a2e", fontFamily:bd }}>

          {/* ── Title ── */}
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:".15em", color:"#1a1a2e", marginBottom:6 }}>{d.title}</div>
            <div style={{ fontSize:11, color:"#888", display:"flex", justifyContent:"center", alignItems:"center", gap:4 }}>No. <EF value={d.num} onChange={v=>updateField("num",v)} style={{ width:150, textAlign:"center", fontSize:11, border:"1px solid #ddd" }} /></div>
          </div>

          {/* ── Partner / Date row ── */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:24, gap:24 }}>
            <div style={{ flex:1 }}>
              <div style={{ borderBottom:"2px solid #1a1a2e", paddingBottom:6, marginBottom:6 }}>
                <EF value={d.partner} onChange={v=>updateField("partner",v)} placeholder="取引先名を入力" style={{ fontSize:16, fontWeight:700, width:"100%", border:"none", borderBottom:"1px dashed #ccc" }} />
                <span style={{ fontSize:14, marginLeft:4 }}>御中</span>
              </div>
              {cfg.hasPartnerAddr && <>
                <EF value={d.partnerAddr} onChange={v=>updateField("partnerAddr",v)} placeholder="取引先住所" style={{ fontSize:10, width:"100%", marginBottom:3, color:"#666" }} />
                <EF value={d.partnerTel} onChange={v=>updateField("partnerTel",v)} placeholder="取引先 TEL" style={{ fontSize:10, width:"100%", color:"#666" }} />
              </>}
              {cfg.hasDeliveryAddr && <div style={{ marginTop:8 }}>
                <div style={{ fontSize:9, color:"#999", marginBottom:2 }}>納品先住所</div>
                <EF value={d.deliveryAddr} onChange={v=>updateField("deliveryAddr",v)} placeholder="納品先住所を入力" style={{ fontSize:10, width:"100%", color:"#666" }} />
              </div>}
            </div>
            <div style={{ minWidth:180, textAlign:"right" }}>
              <div style={{ fontSize:9, color:"#999", marginBottom:2 }}>発行日</div>
              <EF value={d.issueDate} onChange={v=>updateField("issueDate",v)} style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} />
              {cfg.hasDueDate && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>支払期限</div>
                <EF value={d.dueDate} onChange={v=>updateField("dueDate",v)} placeholder="例: 2026/03/31" style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} /></>}
              {cfg.hasValidity && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>有効期限</div>
                <EF value={d.validity} onChange={v=>updateField("validity",v)} placeholder="発行日より30日間" style={{ fontSize:12, textAlign:"right", width:140, marginBottom:8 }} /></>}
              {cfg.hasContractPeriod && <><div style={{ fontSize:9, color:"#999", marginBottom:2 }}>契約期間</div>
                <EF value={d.contractStart} onChange={v=>updateField("contractStart",v)} placeholder="開始日" style={{ fontSize:11, textAlign:"right", width:140, marginBottom:2 }} />
                <span style={{ fontSize:10, color:"#999" }}> 〜 </span>
                <EF value={d.contractEnd} onChange={v=>updateField("contractEnd",v)} placeholder="終了日" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
              {cfg.hasPayMethod && <><div style={{ fontSize:9, color:"#999", marginBottom:2, marginTop:8 }}>支払方法</div>
                <EF value={d.payMethod} onChange={v=>updateField("payMethod",v)} placeholder="現金 / 振込 / カード" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
              {cfg.hasApprover && <><div style={{ fontSize:9, color:"#999", marginBottom:2, marginTop:8 }}>承認者</div>
                <EF value={d.approver} onChange={v=>updateField("approver",v)} placeholder="承認者名" style={{ fontSize:11, textAlign:"right", width:140 }} /></>}
            </div>
          </div>

          {/* ── Total banner (for item-based docs) ── */}
          {hasItemTable && <div style={{ background:"#f4f4f8", borderRadius:8, padding:"14px 20px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>合計金額（税込）</span>
            <span style={{ fontSize:24, fontWeight:700 }}>{fmt(calc.total)}</span>
          </div>}

          {/* ── Single amount (for depositConf etc) ── */}
          {cfg.hasAmount && !hasItemTable && <div style={{ background:"#f4f4f8", borderRadius:8, padding:"14px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>金額</div>
            <EF type="number" value={d.singleAmount} onChange={v=>updateField("singleAmount",v)} style={{ fontSize:24, fontWeight:700, width:240, border:"none", borderBottom:"2px solid #1a1a2e" }} />
          </div>}

          {/* ── Items table (invoices, estimates, etc.) ── */}
          {hasItemTable && <>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:16 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600, width:"40%" }}>品目</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"10%" }}>数量</th>
                  <th style={{ textAlign:"center", padding:"8px 4px", fontWeight:600, width:"10%" }}>単位</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"18%" }}>単価</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600, width:"18%" }}>金額</th>
                  <th style={{ width:24 }}></th>
                </tr>
              </thead>
              <tbody>
                {(d.rows||[]).map((row, idx) => {
                  const lineTotal = (Number(row.qty)||0) * (Number(row.price)||0);
                  return (
                    <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                      <td style={{ padding:"6px 4px" }}><EF value={row.item} onChange={v=>updateRow(idx,"item",v)} placeholder="品目名を入力" style={{ width:"100%" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF type="number" value={row.qty} onChange={v=>updateRow(idx,"qty",v)} style={{ width:56, textAlign:"right" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF value={row.unit} onChange={v=>updateRow(idx,"unit",v)} style={{ width:44, textAlign:"center" }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF type="number" value={row.price} onChange={v=>updateRow(idx,"price",v)} style={{ width:100, textAlign:"right" }} /></td>
                      <td style={{ padding:"6px 4px", textAlign:"right", fontWeight:600, fontFamily:mono, fontSize:12 }}>{fmt(lineTotal)}</td>
                      <td style={{ padding:"6px 2px" }}>{(d.rows||[]).length>1 && <span onClick={()=>removeRow(idx)} style={{ cursor:"pointer", color:"#ccc", fontSize:14, userSelect:"none" }}>×</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <button onClick={addRow} type="button" style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ textAlign:"right", minWidth:200 }}>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:12 }}><span>小計</span><span style={{ fontFamily:mono }}>{fmt(calc.subtotal)}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", fontSize:12 }}><span>消費税（10%）</span><span style={{ fontFamily:mono }}>{fmt(calc.tax)}</span></div>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, fontWeight:700, borderTop:"2px solid #1a1a2e", marginTop:4 }}><span>合計</span><span style={{ fontFamily:mono }}>{fmt(calc.total)}</span></div>
              </div>
            </div>
          </>}

          {/* ── Contract clauses ── */}
          {cfg.hasClauses && (d.clauses||[]).length > 0 && <div style={{ marginBottom:20 }}>
            {(d.clauses||[]).map((cl, idx) => (
              <div key={idx} style={{ marginBottom:16 }}>
                <EF value={cl.title} onChange={v => {
                  const c2 = [...(d.clauses||[])]; c2[idx] = { ...c2[idx], title:v };
                  updateField("clauses", c2);
                }} style={{ fontSize:13, fontWeight:700, width:"100%", marginBottom:4 }} />
                <textarea value={cl.text} onChange={e => {
                  const c2 = [...(d.clauses||[])]; c2[idx] = { ...c2[idx], text:e.target.value };
                  updateField("clauses", c2);
                }} rows={Math.max(3, (cl.text||"").split("\n").length + 1)}
                  style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:4, padding:"6px 8px", fontSize:11, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }}
                  onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
              </div>
            ))}
            <button onClick={() => updateField("clauses", [...(d.clauses||[]), { title:"第"+(((d.clauses||[]).length)+1)+"条（）", text:"" }])} type="button"
              style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 条項を追加</button>
          </div>}

          {/* ── Slip fields (伝票) ── */}
          {cfg.hasSlipFields && <div style={{ marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, marginBottom:10 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>日付</th>
                  {activeDoc==="transferSlip" ? <>
                    <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>借方科目</th>
                    <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>貸方科目</th>
                  </> : <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>勘定科目</th>}
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>相手先</th>
                  <th style={{ textAlign:"right", padding:"8px 4px", fontWeight:600 }}>金額</th>
                  <th style={{ textAlign:"left", padding:"8px 4px", fontWeight:600 }}>摘要</th>
                  <th style={{ width:24 }}></th>
                </tr>
              </thead>
              <tbody>
                {(d.slipEntries||[]).map((e, idx) => (
                  <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"6px 4px" }}><EF value={e.date} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],date:v}; updateField("slipEntries",s); }} style={{ width:90 }} /></td>
                    {activeDoc==="transferSlip" ? <>
                      <td style={{ padding:"6px 4px" }}><EF value={e.debitAcc} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],debitAcc:v}; updateField("slipEntries",s); }} placeholder="借方" style={{ width:90 }} /></td>
                      <td style={{ padding:"6px 4px" }}><EF value={e.creditAcc} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],creditAcc:v}; updateField("slipEntries",s); }} placeholder="貸方" style={{ width:90 }} /></td>
                    </> : <td style={{ padding:"6px 4px" }}><EF value={e.account} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],account:v}; updateField("slipEntries",s); }} style={{ width:100 }} /></td>}
                    <td style={{ padding:"6px 4px" }}><EF value={e.partner||""} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],partner:v}; updateField("slipEntries",s); }} style={{ width:100 }} /></td>
                    <td style={{ padding:"6px 4px" }}><EF type="number" value={e.amount} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],amount:v}; updateField("slipEntries",s); }} style={{ width:90, textAlign:"right" }} /></td>
                    <td style={{ padding:"6px 4px" }}><EF value={e.memo} onChange={v=>{ const s=[...(d.slipEntries||[])]; s[idx]={...s[idx],memo:v}; updateField("slipEntries",s); }} style={{ width:120 }} /></td>
                    <td style={{ padding:"6px 2px" }}>{(d.slipEntries||[]).length>1 && <span onClick={()=>updateField("slipEntries",(d.slipEntries||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:14 }}>×</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={()=>updateField("slipEntries",[...(d.slipEntries||[]),{ date:"2026/02/25", account:"", debitAcc:"", creditAcc:"", partner:"", amount:0, memo:"" }])} type="button"
                style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ fontSize:14, fontWeight:700 }}>合計: {fmt((d.slipEntries||[]).reduce((s,e)=>s+(Number(e.amount)||0),0))}</div>
            </div>
          </div>}

          {/* ── Travel expense rows ── */}
          {cfg.hasTravelRows && <div style={{ marginBottom:20 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, marginBottom:10 }}>
              <thead>
                <tr style={{ borderBottom:"2px solid #1a1a2e" }}>
                  {["日付","出発地","到着地","交通機関","金額","摘要",""].map((h,i) => (
                    <th key={i} style={{ textAlign:i===4?"right":"left", padding:"8px 4px", fontWeight:600, fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(d.travelRows||[]).map((r, idx) => (
                  <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
                    <td style={{ padding:"5px 4px" }}><EF value={r.date} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],date:v}; updateField("travelRows",t); }} style={{ width:80, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.from} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],from:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.to} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],to:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.transport} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],transport:v}; updateField("travelRows",t); }} style={{ width:60, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF type="number" value={r.amount} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],amount:v}; updateField("travelRows",t); }} style={{ width:70, textAlign:"right", fontSize:11 }} /></td>
                    <td style={{ padding:"5px 4px" }}><EF value={r.memo} onChange={v=>{ const t=[...(d.travelRows||[])]; t[idx]={...t[idx],memo:v}; updateField("travelRows",t); }} style={{ width:80, fontSize:11 }} /></td>
                    <td style={{ padding:"5px 2px" }}>{(d.travelRows||[]).length>1 && <span onClick={()=>updateField("travelRows",(d.travelRows||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:14 }}>×</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={()=>updateField("travelRows",[...(d.travelRows||[]),{ date:"2026/02/25", from:"", to:"", transport:"", amount:0, memo:"" }])} type="button"
                style={{ padding:"6px 16px", borderRadius:8, border:"1.5px dashed #ccc", background:"transparent", color:"#888", fontSize:11, cursor:"pointer" }}>+ 行を追加</button>
              <div style={{ fontSize:14, fontWeight:700 }}>合計: {fmt((d.travelRows||[]).reduce((s,r)=>s+(Number(r.amount)||0),0))}</div>
            </div>
          </div>}

          {/* ── Body text (letters, depositConf) ── */}
          {cfg.hasBody && <div style={{ marginBottom:20 }}>
            <textarea value={d.body} onChange={e=>updateField("body",e.target.value)} placeholder="本文を入力してください…" rows={Math.max(6, (d.body||"").split("\n").length + 2)}
              style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:6, padding:"12px 14px", fontSize:12, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.8 }}
              onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
          </div>}

          {/* ── Enclosures (送付状) ── */}
          {cfg.hasEnclosures && <div style={{ marginBottom:20, padding:"12px 16px", background:"#f9f9fc", borderRadius:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#666", marginBottom:8 }}>同封書類</div>
            {(d.enclosures||[]).map((enc, idx) => (
              <div key={idx} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:12 }}>・</span>
                <EF value={enc} onChange={v=>{ const e2=[...(d.enclosures||[])]; e2[idx]=v; updateField("enclosures",e2); }} style={{ flex:1, fontSize:11 }} />
                <span onClick={()=>updateField("enclosures",(d.enclosures||[]).filter((_,i)=>i!==idx))} style={{ cursor:"pointer", color:"#ccc", fontSize:13 }}>×</span>
              </div>
            ))}
            <button onClick={()=>updateField("enclosures",[...(d.enclosures||[]),""])} type="button"
              style={{ padding:"4px 12px", borderRadius:6, border:"1px dashed #ccc", background:"transparent", color:"#888", fontSize:10, cursor:"pointer", marginTop:4 }}>+ 書類を追加</button>
          </div>}

          {/* ── Note ── */}
          {cfg.hasNote && <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#999", marginBottom:4 }}>備考</div>
            <textarea value={d.note} onChange={e=>updateField("note",e.target.value)} placeholder="備考・特記事項" rows={3}
              style={{ width:"100%", border:"1px solid #e0e0e8", borderRadius:6, padding:"8px 12px", fontSize:11, fontFamily:bd, color:"#1a1a2e", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }}
              onFocus={e=>{e.target.style.borderColor="#4466EE";}} onBlur={e=>{e.target.style.borderColor="#e0e0e8";}} />
          </div>}

          {/* ── Bank info ── */}
          {cfg.hasBank && <div style={{ background:"#f9f9fc", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#666", marginBottom:8 }}>振込先</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              <div><div style={{ fontSize:9, color:"#999" }}>銀行・支店</div><EF value={d.bankName} onChange={v=>updateField("bankName",v)} style={{ width:"100%", fontSize:11 }} /></div>
              <div><div style={{ fontSize:9, color:"#999" }}>口座番号</div><EF value={d.bankAccount} onChange={v=>updateField("bankAccount",v)} style={{ width:"100%", fontSize:11 }} /></div>
              <div style={{ gridColumn:"span 2" }}><div style={{ fontSize:9, color:"#999" }}>口座名義</div><EF value={d.bankHolder} onChange={v=>updateField("bankHolder",v)} style={{ width:"100%", fontSize:11 }} /></div>
            </div>
          </div>}

          {/* ── Issuer / Signatures ── */}
          <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid #eee" }}>
            {cfg.hasClauses ? (
              /* Contract: dual signature */
              <div style={{ display:"flex", justifyContent:"space-between", gap:40 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:8 }}>甲（委託者/発注者）</div>
                  <EF value={d.partner||""} onChange={v=>updateField("partner",v)} placeholder="甲の名称" style={{ fontSize:13, fontWeight:700, textAlign:"center", width:"100%", marginBottom:4 }} />
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"8px auto", opacity:.5 }}>印</div>}
                </div>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#999", marginBottom:8 }}>乙（受託者/受注者）</div>
                  <EF value={d.issuerName} onChange={v=>updateField("issuerName",v)} style={{ fontSize:13, fontWeight:700, textAlign:"center", width:"100%", marginBottom:4 }} />
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"8px auto", opacity:.5 }}>印</div>}
                </div>
              </div>
            ) : (
              /* Normal: single issuer */
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }} />
                <div style={{ textAlign:"right" }}>
                  <EF value={d.issuerName} onChange={v=>updateField("issuerName",v)} style={{ fontSize:13, fontWeight:700, textAlign:"right", width:220 }} />
                  <EF value={d.issuerAddr} onChange={v=>updateField("issuerAddr",v)} style={{ fontSize:10, color:"#888", textAlign:"right", width:220, marginTop:2 }} />
                  <div style={{ display:"flex", gap:4, justifyContent:"flex-end", marginTop:2 }}>
                    <span style={{ fontSize:10, color:"#888" }}>TEL:</span><EF value={d.issuerTel} onChange={v=>updateField("issuerTel",v)} style={{ fontSize:10, color:"#888", width:120, textAlign:"right" }} />
                  </div>
                  <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
                    <span style={{ fontSize:10, color:"#888" }}>Email:</span><EF value={d.issuerEmail} onChange={v=>updateField("issuerEmail",v)} style={{ fontSize:10, color:"#888", width:160, textAlign:"right" }} />
                  </div>
                  <div style={{ fontSize:10, color:"#888", marginTop:2 }}>登録番号: <EF value={d.invoiceNum} onChange={v=>updateField("invoiceNum",v)} style={{ fontSize:10, color:"#888", width:150 }} /></div>
                  {cfg.hasStamp && <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid #cc3333", color:"#cc3333", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:"auto", marginTop:8, opacity:.5 }}>印</div>}
                </div>
              </div>
            )}
          </div>
        </div></Rv>
        </div>

        {/* ── AI Assistant Panel (right) ── */}
        <div style={{ width: aiOpen ? 300 : 44, flexShrink:0, transition:"width .3s cubic-bezier(.16,1,.3,1)" }}>
          {!aiOpen ? (
            <Mag onClick={()=>setAiOpen(true)} s={{ width:44, height:44, borderRadius:14, background:"rgba(139,123,244,.08)", border:"1.5px solid rgba(139,123,244,.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"sticky", top:100, boxShadow:"0 0 20px rgba(139,123,244,.15)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </Mag>
          ) : (
            <div style={{ position:"sticky", top:80, background:"rgba(12,12,20,.6)", border:"1.5px solid rgba(139,123,244,.12)", borderRadius:16, overflow:"hidden", backdropFilter:"blur(20px)" }}>
              {/* Header */}
              <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(139,123,244,.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:24, height:24, borderRadius:8, background:"rgba(139,123,244,.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A89BFF" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#C4B8FF" }}>AIアシスタント</span>
                </div>
                <Mag onClick={()=>setAiOpen(false)} s={{ border:"none", background:"transparent", color:C.textMut, fontSize:14, cursor:"pointer", padding:4 }}>×</Mag>
              </div>

              {/* Recommendations */}
              <div style={{ padding:"12px 14px", maxHeight:360, overflowY:"auto" }}>
                <div style={{ fontSize:9, color:C.textMut, fontWeight:600, letterSpacing:".1em", marginBottom:8 }}>おすすめの改善</div>
                {(aiRecommendations[activeDoc] || []).map((rec, i) => (
                  <Mag key={i} onClick={() => setAiChat(prev => [...prev, { role:"user", text:rec.l }, { role:"ai", text:`「${rec.l}」を反映します。\n\n${rec.d}\n\n※ 左の書類に直接内容を追記・編集してください。` }])}
                    s={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", marginBottom:6, borderRadius:10, border:"1px solid rgba(139,123,244,.08)", background:"rgba(139,123,244,.03)", cursor:"pointer", fontFamily:bd, transition:"all .15s" }}>
                    <div style={{ fontSize:11, color:"#E0DAFF", fontWeight:600, marginBottom:2 }}>{rec.l}</div>
                    <div style={{ fontSize:9, color:C.textMut, lineHeight:1.3 }}>{rec.d}</div>
                  </Mag>
                ))}
                {(aiRecommendations[activeDoc] || []).length === 0 && (
                  <div style={{ fontSize:10, color:C.textMut, padding:8 }}>この書類タイプのレコメンドはありません</div>
                )}
              </div>

              {/* Chat history */}
              {aiChat.length > 0 && <div style={{ borderTop:"1px solid rgba(139,123,244,.08)", padding:"10px 14px", maxHeight:200, overflowY:"auto" }}>
                {aiChat.map((msg, i) => (
                  <div key={i} style={{ marginBottom:8, display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"90%", padding:"8px 12px", borderRadius:msg.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px", background:msg.role==="user"?"rgba(139,123,244,.12)":"rgba(255,255,255,.04)", border:`1px solid ${msg.role==="user"?"rgba(139,123,244,.2)":"rgba(255,255,255,.06)"}` }}>
                      <div style={{ fontSize:10, color:msg.role==="user"?"#C4B8FF":"#E0DAFF", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>}

              {/* Input */}
              <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(139,123,244,.08)" }}>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)}
                    placeholder="質問や依頼を入力…"
                    onKeyDown={e=>{
                      if(e.key==="Enter"&&aiInput.trim()){
                        const q=aiInput.trim(); setAiInput("");
                        setAiChat(prev=>[...prev,{role:"user",text:q},{role:"ai",text:`「${q}」について確認しました。\n\n書類の内容を左のプレビューで直接編集できます。条項の追加・変更が必要な場合は、おすすめの改善から選択するか、具体的にご指示ください。`}]);
                      }
                    }}
                    style={{ flex:1, padding:"8px 12px", borderRadius:10, border:"1px solid rgba(139,123,244,.12)", background:"rgba(139,123,244,.03)", color:"#E0DAFF", fontSize:11, fontFamily:bd, outline:"none", boxSizing:"border-box" }} />
                  <Mag onClick={()=>{
                    if(!aiInput.trim())return; const q=aiInput.trim(); setAiInput("");
                    setAiChat(prev=>[...prev,{role:"user",text:q},{role:"ai",text:`「${q}」について確認しました。\n\n書類の内容を左のプレビューで直接編集できます。`}]);
                  }} s={{ width:34, height:34, borderRadius:10, border:"none", background:"rgba(139,123,244,.12)", color:"#A89BFF", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
                  </Mag>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </PageShell>
    );
  }

  /* ── TEMPLATE LIST / ISSUED LIST ── */
  const catItems = activeCat === "all" ? allItems : templates.find(c=>c.cat===activeCat)?.items || [];

  return (
    <PageShell title="書類発行" watermark={"書類\n発行"}>
      <Rv><div style={{ display:"flex", gap:3, marginBottom:16, background:"rgba(139,123,244,.04)", borderRadius:14, padding:3, border:"1px solid rgba(139,123,244,.06)", width:"fit-content" }}>
        {[{ id:"templates", l:"テンプレート（22種）" },{ id:"issued", l:"発行済み（"+issued.length+"件）" }].map(t => (
          <Mag key={t.id} onClick={()=>setTab(t.id)} s={{ padding:"8px 20px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:bd, fontSize:12, fontWeight:tab===t.id?700:500, background:tab===t.id?"rgba(139,123,244,.15)":"transparent", color:tab===t.id?"#C4B8FF":"rgba(168,155,255,.35)", boxShadow:tab===t.id?"0 0 14px rgba(139,123,244,.2)":"none", transition:"all .25s" }}>{t.l}</Mag>
        ))}
      </div></Rv>

      {tab === "templates" ? (<>
        <Rv d={10}><div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
          {["all",...templates.map(c=>c.cat)].map(c => (
            <Mag key={c} onClick={()=>setActiveCat(c)} s={{ padding:"6px 16px", borderRadius:20, border:activeCat===c?"1px solid rgba(139,123,244,.3)":"1px solid rgba(255,255,255,.05)", background:activeCat===c?"rgba(139,123,244,.1)":"transparent", color:activeCat===c?"#C4B8FF":"rgba(168,155,255,.35)", fontSize:11, fontWeight:activeCat===c?700:500, cursor:"pointer", fontFamily:bd }}>
              {c==="all"?"すべて (22)":c}
            </Mag>
          ))}
        </div></Rv>

        {(activeCat === "all" ? templates : templates.filter(c=>c.cat===activeCat)).map((cat, ci) => (
          <Rv key={ci} d={15+ci*10}>
            {activeCat === "all" && <div style={{ fontSize:13, color:C.textSec, fontWeight:600, marginBottom:10, marginTop:ci?18:0, display:"flex", alignItems:"center", gap:8 }}>
              <span>{cat.cat}</span>
              <div style={{ flex:1, height:1, background:C.borderLt }} />
              <span style={{ fontSize:10, color:C.textMut }}>{cat.items.length}種</span>
            </div>}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:10, marginBottom:8 }}>
              {cat.items.map(item => (
                <Mag key={item.id} onClick={()=>openPreview(item.id)} s={{ cursor:"pointer", display:"block" }}>
                  <Card3 s={{ padding:"20px 16px", transition:"border-color .2s" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"rgba(139,123,244,.08)", border:"1px solid rgba(139,123,244,.12)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, color:"#A89BFF" }}>
                      {(icons[item.id] || icons.invoice)("#A89BFF")}
                    </div>
                    <div style={{ fontSize:13, color:"#fff", fontWeight:600, marginBottom:4 }}>{item.name}</div>
                    <div style={{ fontSize:10, color:C.textMut, lineHeight:1.4 }}>{item.desc}</div>
                  </Card3>
                </Mag>
              ))}
            </div>
          </Rv>
        ))}
      </>) : (
        <Rv d={10}><Card3 s={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:bd }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["No.","種別","取引先","金額","発行日","ステータス",""].map((h,i) => (
                  <th key={i} style={{ padding:"12px 10px", textAlign:i===3?"right":"left", fontSize:9, fontWeight:600, color:C.textMut, letterSpacing:".1em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issued.map((doc,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.borderLt}`, cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${C.blue}04`} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"12px 10px", color:C.textMut, fontFamily:mono, fontSize:11 }}>{doc.id}</td>
                  <td style={{ padding:"12px 10px" }}><span style={{ fontSize:10, padding:"3px 10px", borderRadius:8, background:"rgba(139,123,244,.06)", color:C.textSec }}>{doc.type}</span></td>
                  <td style={{ padding:"12px 10px", color:"#fff", fontWeight:500 }}>{doc.partner}</td>
                  <td style={{ padding:"12px 10px", textAlign:"right", color:"#C4B8FF", fontFamily:mono, fontWeight:600 }}>{fmt(doc.amount)}</td>
                  <td style={{ padding:"12px 10px", color:C.textMut, fontFamily:mono }}>{doc.date}</td>
                  <td style={{ padding:"12px 10px" }}><span style={{ fontSize:9, fontWeight:700, color:stColor(doc.status), padding:"3px 10px", borderRadius:20, background:`${stColor(doc.status)}10`, border:`1px solid ${stColor(doc.status)}20` }}>{doc.status}</span></td>
                  <td style={{ padding:"12px 10px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <Mag s={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:9, cursor:"pointer", fontFamily:bd }}>編集</Mag>
                      <Mag s={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", color:C.textMut, fontSize:9, cursor:"pointer", fontFamily:bd }}>PDF</Mag>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issued.length === 0 && <div style={{ padding:40, textAlign:"center", color:C.textMut, fontSize:12 }}>発行済み書類はありません</div>}
        </Card3></Rv>
      )}
    </PageShell>
  );
}

/* ════════════════════════════════ 入力 (INPUT) — B案 丸ボタン ════════════════════════════════ */

export default DocIssuePage;
