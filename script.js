// 設置今天日期
document.getElementById('quoteDate').value = new Date().toISOString().split('T')[0];

let isDrawing = false;
let currentCanvas = null;

// 監聽表單變化
document.addEventListener('input', updatePreview);
document.addEventListener('change', updatePreview);

// 初始化預覽
updatePreview();

function addItem() {
    const itemsList = document.getElementById('itemsList');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <div class="form-group">
            <label>項目名稱</label>
            <input type="text" class="item-name" placeholder="服務項目">
        </div>
        <div class="form-group">
            <label>數量</label>
            <input type="number" class="item-quantity" value="1" min="1">
        </div>
        <div class="form-group">
            <label>單價</label>
            <input type="number" class="item-price" placeholder="0">
        </div>
        <div class="form-group">
            <label>金額</label>
            <input type="number" class="item-amount" readonly>
        </div>
        <div class="form-group">
            <button type="button" class="remove-btn" onclick="removeItem(this)" style="margin-top: 24px;">刪除</button>
        </div>
    `;
    itemsList.appendChild(newItem);
    
    // 為新項目添加事件監聽
    const inputs = newItem.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

function removeItem(button) {
    if (document.querySelectorAll('.item-row').length > 1) {
        button.closest('.item-row').remove();
        updatePreview();
    }
}

function updatePreview() {
    // 更新基本資訊
    document.getElementById('previewQuoteNumber').textContent = 
        document.getElementById('quoteNumber').value || 'Q001';
    document.getElementById('previewDate').textContent = 
        document.getElementById('quoteDate').value || '';
    document.getElementById('previewProjectName').textContent = 
        document.getElementById('projectName').value || '-';
    document.getElementById('previewProviderName').textContent = 
        document.getElementById('providerName').value || '-';
    document.getElementById('previewProviderContact').textContent = 
        document.getElementById('providerContact').value || '-';
    document.getElementById('previewClientName').textContent = 
        document.getElementById('clientName').value || '-';
    document.getElementById('previewClientContact').textContent = 
        document.getElementById('clientContact').value || '-';
    
    // 更新項目列表
    const itemRows = document.querySelectorAll('.item-row');
    const previewItemsList = document.getElementById('previewItemsList');
    previewItemsList.innerHTML = '';
    
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const name = row.querySelector('.item-name').value || '-';
        const quantity = parseInt(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const amount = quantity * price;
        
        // 更新金額欄位
        row.querySelector('.item-amount').value = amount;
        
        subtotal += amount;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${name}</td>
            <td class="amount">${quantity}</td>
            <td class="amount">NT$ ${price.toLocaleString()}</td>
            <td class="amount">NT$ ${amount.toLocaleString()}</td>
        `;
        previewItemsList.appendChild(tr);
    });
    
    // 計算總計
    const total = subtotal;
    
    document.getElementById('total').textContent = `NT$ ${total.toLocaleString()}`;
    
    // 更新備註
    const notes = document.getElementById('notes').value;
    const previewNotes = document.getElementById('previewNotes');
    if (notes) {
        previewNotes.innerHTML = `<div style="margin-top: 20px;"><h4>備註：</h4><p>${notes}</p></div>`;
    } else {
        previewNotes.innerHTML = '';
    }
}

function startSigning(type) {
    const canvas = document.getElementById(type + 'Signature');
    const placeholder = document.getElementById(type + 'Placeholder');
    const ctx = canvas.getContext('2d');
    
    currentCanvas = canvas;
    placeholder.style.display = 'none';
    canvas.style.display = 'block';
    
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let scaleY = canvas.height / rect.height;
    
    function startDrawing(e) {
        isDrawing = true;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
        updateSignaturePreview(type);
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
}

function clearSignature(type) {
    const canvas = document.getElementById(type + 'Signature');
    const placeholder = document.getElementById(type + 'Placeholder');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    placeholder.style.display = 'block';
    canvas.style.display = 'none';
    
    // 清除預覽
    document.getElementById(type + 'SignaturePreview').innerHTML = '';
}

function updateSignaturePreview(type) {
    const canvas = document.getElementById(type + 'Signature');
    const preview = document.getElementById(type + 'SignaturePreview');
    const dataURL = canvas.toDataURL();
    preview.innerHTML = `<img src="${dataURL}" style="max-width: 150px; max-height: 60px;">`;
}

// 修復後的分享功能 - 解決中文亂碼問題
function shareQuote() {
    // 收集所有表單資料
    const quoteData = {
        quoteNumber: document.getElementById('quoteNumber').value,
        quoteDate: document.getElementById('quoteDate').value,
        projectName: document.getElementById('projectName').value,
        providerName: document.getElementById('providerName').value,
        clientName: document.getElementById('clientName').value,
        providerContact: document.getElementById('providerContact').value,
        clientContact: document.getElementById('clientContact').value,
        notes: document.getElementById('notes').value,
        items: []
    };
    
    // 收集項目資料
    document.querySelectorAll('.item-row').forEach(row => {
        const name = row.querySelector('.item-name').value;
        const quantity = row.querySelector('.item-quantity').value;
        const price = row.querySelector('.item-price').value;
        
        quoteData.items.push({
            name: name,
            quantity: quantity,
            price: price
        });
    });
    
    // 收集簽名
    const providerCanvas = document.getElementById('providerSignature');
    const clientCanvas = document.getElementById('clientSignature');
    
    if (!isCanvasEmpty(providerCanvas)) {
        quoteData.providerSignature = providerCanvas.toDataURL('image/png');
    }
    
    if (!isCanvasEmpty(clientCanvas)) {
        quoteData.clientSignature = clientCanvas.toDataURL('image/png');
    }
    
    // 生成分享連結 - 修復中文編碼問題
    try {
        const jsonStr = JSON.stringify(quoteData);
        // 使用 TextEncoder 和 btoa 正確處理中文字符
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
        const encodedData = btoa(binaryString);
        const shareUrl = `${window.location.origin}${window.location.pathname}?view=client#${encodedData}`;
        
        copyToClipboard(shareUrl);
        
        if (quoteData.providerSignature) {
            showToast('分享連結已生成！包含完整內容和簽名 ✅', 'success');
        } else {
            showToast('分享連結已生成！包含完整內容 📋', 'success');
        }
        
        console.log('分享資料:', quoteData); // 除錯用
        
    } catch (error) {
        console.error('分享失敗:', error);
        showToast('分享連結生成失敗，請重試', 'error');
    }
}

// 自動消失的通知系統
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        color: white;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : ''}
        ${type === 'error' ? 'background: #ef4444;' : ''}
        ${type === 'info' ? 'background: #3b82f6;' : ''}
    `;
    
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 檢查canvas是否為空
function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
}

// 複製到剪貼板
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            // 成功複製
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 備用複製方法
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                // 成功複製，不需要額外提示
            } catch (err) {
                showToast('無法複製連結，請手動複製', 'error');
            }
            
            document.body.removeChild(textArea);
        }
        
        function downloadPDF() {
            // 使用html2canvas將預覽區域轉為圖片，然後生成PDF
            const previewElement = document.getElementById('quotePreview');
            
            // 臨時隱藏一些不需要的元素
            const originalStyle = previewElement.style.cssText;
            previewElement.style.width = '210mm';
            previewElement.style.minHeight = 'auto';
            previewElement.style.padding = '20px';
            previewElement.style.background = 'white';
            
            html2canvas(previewElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // A4寬度像素
                height: 1123 // A4高度像素
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210; // A4寬度mm
                const pageHeight = 297; // A4高度mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                // 添加第一頁
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // 如果內容超過一頁，添加新頁面
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // 恢復原始樣式
                previewElement.style.cssText = originalStyle;
                
                // 生成檔案名稱
                const projectName = document.getElementById('projectName').value || '專案';
                const quoteNumber = document.getElementById('quoteNumber').value || 'Q001';
                const fileName = projectName + '_' + quoteNumber + '.pdf';
                
                doc.save(fileName);
            }).catch(error => {
                console.error('PDF生成失敗:', error);
                // 恢復原始樣式
                previewElement.style.cssText = originalStyle;
                alert('PDF生成失敗，請重試');
            });
        }
        
        // 載入分享的資料
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const viewMode = urlParams.get('view');
            
            // 檢查URL fragment中的資料
            const hashData = window.location.hash.substring(1);
            const queryData = urlParams.get('data');
            
            const data = hashData || queryData;
            
            if (data) {
                try {
                    // 修復中文解碼問題
                    let quoteData;
                    try {
                        // 嘗試新的解碼方式（支援中文）
                        const decodedStr = decodeURIComponent(escape(atob(data)));
                        quoteData = JSON.parse(decodedStr);
                    } catch (e) {
                        // 降級到舊的解碼方式
                        try {
                            const decodedStr = atob(data);
                            quoteData = JSON.parse(decodedStr);
                        } catch (e2) {
                            throw new Error('無法解碼資料');
                        }
                    }
                    
                    console.log('成功載入報價資料:', quoteData);
                    
                    if (viewMode === 'client') {
                        setupClientView(quoteData);
                    } else {
                        loadQuoteData(quoteData);
                    }
                } catch (e) {
                    console.error('載入分享資料失敗:', e);
                    if (viewMode === 'client') {
                        document.body.innerHTML = `
                            <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; background: #f8fafc;">
                                <div style="text-align: center; max-width: 500px; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    <h2 style="color: #ef4444; margin-bottom: 20px;">⚠️ 連結載入失敗</h2>
                                    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
                                        無法載入報價單資料，請聯繫服務提供者重新發送連結。
                                    </p>
                                    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 20px;">
                                        錯誤詳情：${e.message}
                                    </p>
                                    <button onclick="window.location.href=window.location.origin+window.location.pathname" 
                                            style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                                        返回首頁
                                    </button>
                                </div>
                            </div>
                        `;
                    } else {
                        showToast('無法載入報價單資料，請檢查連結是否完整', 'error');
                    }
                }
            } else if (viewMode === 'client') {
                document.body.innerHTML = `
                    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; background: #f8fafc;">
                        <div style="text-align: center; max-width: 500px; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #f59e0b; margin-bottom: 20px;">📄 找不到報價單</h2>
                            <p style="color: #6b7280; line-height: 1.6;">
                                請確認您使用的是完整的報價單連結。
                            </p>
                        </div>
                    </div>
                `;
            }
        });
        
        // 設置客戶檢視模式
        function setupClientView(quoteData) {
            // 隱藏表單區域，只顯示預覽和簽名功能
            const formSection = document.querySelector('.form-section');
            const previewSection = document.querySelector('.preview-section');
            
            // 修改頁面標題
            document.querySelector('.header h1').textContent = '報價單確認';
            document.querySelector('.header p').textContent = '請檢視報價內容並進行簽名確認';
            
            // 調整佈局
            document.querySelector('.main-content').style.gridTemplateColumns = '1fr';
            formSection.style.display = 'none';
            previewSection.style.maxWidth = '900px';
            previewSection.style.margin = '0 auto';
            previewSection.style.padding = '40px';
            
            // 載入資料到預覽
            loadQuoteData(quoteData);
            
            // 在預覽區域底部添加客戶簽名區
            const clientSignatureSection = document.createElement('div');
            clientSignatureSection.innerHTML = `
                <div style="margin-top: 40px; padding: 20px; border-top: 2px solid #e5e7eb;">
                    <h4 style="margin-bottom: 20px; text-align: center;">客戶簽名確認</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center;">
                            <div style="border: 1px dashed #d1d5db; height: 120px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; background: #f9fafb;" onclick="startClientSigning()">
                                <canvas id="clientSignatureClient" width="200" height="120" style="width: 100%; height: 100%; border-radius: 6px; display: none;"></canvas>
                                <span id="clientPlaceholderClient">點擊此處簽名</span>
                            </div>
                            <div style="margin-top: 10px;">
                                <button type="button" onclick="clearClientSignature()" style="background: #6b7280; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">清除簽名</button>
                                <button type="button" onclick="confirmQuote()" style="background: #10b981; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">確認報價單</button>
                            </div>
                            <div style="margin-top: 15px;">
                                <p style="color: #6b7280; font-size: 14px;">甲方簽名</p>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="height: 120px; display: flex; align-items: center; justify-content: center;">
                                <div id="providerSignatureDisplay"></div>
                            </div>
                            <div style="margin-top: 25px;">
                                <p style="color: #6b7280; font-size: 14px;">乙方簽名</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            previewSection.appendChild(clientSignatureSection);
            
            // 顯示乙方簽名（如果有的話）
            const providerSig = quoteData.ps || quoteData.providerSignature;
            if (providerSig) {
                document.getElementById('providerSignatureDisplay').innerHTML = 
                    `<img src="${providerSig}" style="max-width: 150px; max-height: 60px; border: 1px solid #d1d5db; border-radius: 4px;">`;
            }
        }
        
        // 客戶簽名功能
        function startClientSigning() {
            const canvas = document.getElementById('clientSignatureClient');
            const placeholder = document.getElementById('clientPlaceholderClient');
            const ctx = canvas.getContext('2d');
            
            placeholder.style.display = 'none';
            canvas.style.display = 'block';
            
            let isDrawing = false;
            let rect = canvas.getBoundingClientRect();
            let scaleX = canvas.width / rect.width;
            let scaleY = canvas.height / rect.height;
            
            function startDrawing(e) {
                isDrawing = true;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
            
            function draw(e) {
                if (!isDrawing) return;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#000';
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
            
            function stopDrawing() {
                isDrawing = false;
                ctx.beginPath();
            }
            
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
        }
        
        function clearClientSignature() {
            const canvas = document.getElementById('clientSignatureClient');
            const placeholder = document.getElementById('clientPlaceholderClient');
            const ctx = canvas.getContext('2d');
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            placeholder.style.display = 'block';
            canvas.style.display = 'none';
        }
        
        function confirmQuote() {
            const canvas = document.getElementById('clientSignatureClient');
            if (isCanvasEmpty(canvas)) {
                alert('請先簽名再確認報價單');
                return;
            }
            
            const signature = canvas.toDataURL();
            
            // 更新預覽區域的客戶簽名
            const clientSignaturePreview = document.querySelector('.signature-preview .signature-area:last-child div');
            if (clientSignaturePreview) {
                clientSignaturePreview.innerHTML = `<img src="${signature}" style="max-width: 150px; max-height: 60px;">`;
            }
            
            // 隱藏簽名區域，顯示完成狀態
            const signatureSection = document.querySelector('[onclick="startClientSigning()"]').closest('div[style*="margin-top: 40px"]');
            signatureSection.innerHTML = `
                <div style="margin-top: 40px; display: flex; justify-content: center;">
                    <div style="width: 100%; max-width: 600px; padding: 30px; background: #f0f9ff; border-radius: 12px; border: 2px solid #10b981;">
                        <div style="color: #059669; font-size: 20px; font-weight: 600; margin-bottom: 20px; text-align: center;">
                            ✓ 報價單確認完成！
                        </div>
                        <div style="color: #374151; margin-bottom: 25px; line-height: 1.6; text-align: center; font-size: 16px;">
                            感謝您的確認。請下載完整的報價單PDF檔案，並回傳給我們以完成流程。
                        </div>
                        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                            <button onclick="downloadSignedPDF()" style="background: #3b82f6; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                📄 下載完整PDF
                            </button>
                        </div>
                        <div style="padding: 15px; background: #f9fafb; border-radius: 8px; color: #6b7280; font-size: 14px; text-align: center;">
                            💡 請將下載的PDF檔案回傳給服務提供者
                        </div>
                    </div>
                </div>
            `;
            
            // 儲存簽名資料到全域變數以供下載使用
            window.clientSignatureData = signature;
            
            console.log('客戶簽名完成:', signature);
        }
        
        // 下載已簽名的完整PDF
        function downloadSignedPDF() {
            // 臨時更新預覽區域以包含客戶簽名
            const previewElement = document.getElementById('quotePreview');
            const clientSignatureArea = previewElement.querySelector('.signature-preview .signature-area:last-child div');
            
            // 確保客戶簽名顯示在預覽中
            if (window.clientSignatureData && clientSignatureArea) {
                clientSignatureArea.innerHTML = `<img src="${window.clientSignatureData}" style="max-width: 150px; max-height: 60px;">`;
            }
            
            // 使用現有的PDF生成功能
            const originalStyle = previewElement.style.cssText;
            previewElement.style.width = '210mm';
            previewElement.style.minHeight = 'auto';
            previewElement.style.padding = '20px';
            previewElement.style.background = 'white';
            
            html2canvas(previewElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;
                
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                previewElement.style.cssText = originalStyle;
                
                // 取得報價單資訊
                const hashData = window.location.hash.substring(1);
                const urlParams = new URLSearchParams(window.location.search);
                const queryData = urlParams.get('data');
                const data = hashData || queryData;
                
                let projectName = '專案';
                let quoteNumber = 'Q001';
                
                if (data) {
                    try {
                        const quoteData = JSON.parse(atob(data + '==='.substring(0, (4 - data.length % 4) % 4)));
                        projectName = quoteData.pn || quoteData.projectName || '專案';
                        quoteNumber = quoteData.qn || quoteData.quoteNumber || 'Q001';
                    } catch (e) {
                        console.error('無法解析報價單資料');
                    }
                }
                
                const fileName = `${projectName}_${quoteNumber}_已確認.pdf`;
                doc.save(fileName);
                
                // 顯示下載完成提示
                setTimeout(() => {
                    showToast('PDF下載完成！請將檔案回傳給服務提供者', 'success');
                }, 500);
                
            }).catch(error => {
                console.error('PDF生成失敗:', error);
                previewElement.style.cssText = originalStyle;
                alert('PDF生成失敗，請重試');
            });
        }
        
        // 載入報價資料的通用函數
        function loadQuoteData(quoteData) {
            // 處理簡化的欄位名稱映射
            const fieldMapping = {
                'qn': 'quoteNumber',
                'qd': 'quoteDate', 
                'pn': 'projectName',
                'pr': 'providerName',
                'cl': 'clientName',
                'prc': 'providerContact',
                'clc': 'clientContact',
                'nt': 'notes'
            };
            
            // 填入基本資料
            Object.keys(fieldMapping).forEach(shortKey => {
                if (quoteData[shortKey]) {
                    const element = document.getElementById(fieldMapping[shortKey]);
                    if (element) {
                        element.value = quoteData[shortKey];
                    }
                }
            });
            
            // 處理舊格式的向後相容性
            Object.keys(quoteData).forEach(key => {
                const element = document.getElementById(key);
                if (element && typeof quoteData[key] === 'string') {
                    element.value = quoteData[key];
                }
            });
            
            // 載入項目資料
            const items = quoteData.it || quoteData.items || [];
            if (items.length > 0) {
                const itemsList = document.getElementById('itemsList');
                itemsList.innerHTML = ''; // 清空現有項目
                
                items.forEach(item => {
                    const itemRow = document.createElement('div');
                    itemRow.className = 'item-row';
                    itemRow.innerHTML = `
                        <div class="form-group">
                            <label>項目名稱</label>
                            <input type="text" class="item-name" value="${item.n || item.name || ''}" placeholder="服務項目">
                        </div>
                        <div class="form-group">
                            <label>數量</label>
                            <input type="number" class="item-quantity" value="${item.q || item.quantity || 1}" min="1">
                        </div>
                        <div class="form-group">
                            <label>單價</label>
                            <input type="number" class="item-price" value="${item.p || item.price || 0}" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label>金額</label>
                            <input type="number" class="item-amount" readonly>
                        </div>
                        <div class="form-group">
                            <button type="button" class="remove-btn" onclick="removeItem(this)" style="margin-top: 24px;">刪除</button>
                        </div>
                    `;
                    itemsList.appendChild(itemRow);
                    
                    // 為新項目添加事件監聽
                    const inputs = itemRow.querySelectorAll('input');
                    inputs.forEach(input => {
                        input.addEventListener('input', updatePreview);
                    });
                });
            }
            
            // 載入簽名
            const providerSig = quoteData.ps || quoteData.providerSignature;
            const clientSig = quoteData.cs || quoteData.clientSignature;
            
            if (providerSig) {
                document.getElementById('providerSignaturePreview').innerHTML = 
                    `<img src="${providerSig}" style="max-width: 150px; max-height: 60px;">`;
            }
            
            if (clientSig) {
                document.getElementById('clientSignaturePreview').innerHTML = 
                    `<img src="${clientSig}" style="max-width: 150px; max-height: 60px;">`;
            }
            
            updatePreview();
        }
    </script>
</body>
</html>
