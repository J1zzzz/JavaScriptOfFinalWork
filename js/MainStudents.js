// 页面加载时获取学生数据
document.addEventListener('DOMContentLoaded', function() {
  fetchStudents(1);
});

// 获取学生数据
async function fetchStudents(page = 1) {
  try {
    const response = await fetch(`http://localhost:8080/api/Db-SearchAll?page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("data"+ data);
    // 检查返回的数据结构
    if (data.stuInfo) {
      updateTable(data.stuInfo);
      updatePagination(data.currentPage, data.totalPages);
    } else {
      alert('获取数据失败：返回的数据格式不正确');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('获取数据失败，请稍后重试');
  }
}
// 更新表格内容
function updateTable(students) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  if (students && students.length > 0) {
    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
                <td>${student.stu_no}</td>
                <td>${student.stu_name}</td>
                <td>${student.stu_Class.class_name}</td>
                <td>${student.stu_Class.subject}</td>
                <td>${student.stu_Class.class_department}</td>
                <td>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="button" class="delete-button" onclick="deleteStudent('${student.stu_no}')">删除学生</button>
                        <button type="button" class="modify-button" onclick="openModifyModal('${student.stu_no}', '${student.stu_name}', '${student.class_id}')">修改信息</button>
                    </div>
                </td>
            `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="6">没有学生信息</td></tr>';
  }
}

// 更新分页
function updatePagination(currentPage, totalPages) {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  if (currentPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.textContent = '上一页';
    prevLink.onclick = (e) => {
      e.preventDefault();
      fetchStudents(currentPage - 1);
    };
    pagination.appendChild(prevLink);
  }

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement(currentPage === i ? 'span' : 'a');
    pageLink.textContent = i;
    pageLink.className = currentPage === i ? 'current' : '';

    if (currentPage !== i) {
      pageLink.href = '#';
      pageLink.onclick = (e) => {
        e.preventDefault();
        fetchStudents(i);
      };
    }

    pagination.appendChild(pageLink);
  }

  if (currentPage < totalPages) {
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.textContent = '下一页';
    nextLink.onclick = (e) => {
      e.preventDefault();
      fetchStudents(currentPage + 1);
    };
    pagination.appendChild(nextLink);
  }
}

// 删除学生
async function deleteStudent(studentId) {
  if (!confirm('确定要删除这个学生吗？')) {
    return;
  }

  try {
    const response = await fetch('api/Db-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `studentId=${studentId}&action=delete`
    });

    const data = await response.json();

    if (data.success) {
      alert('删除成功');
      fetchStudents(); // 刷新数据
    } else {
      alert('删除失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('删除失败，请稍后重试');
  }
}

// 添加学生
async function addStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('api/Db-insert', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert('添加成功');
      closeAddModal();
      fetchStudents();
    } else {
      alert('添加失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('添加失败，请稍后重试');
  }
}

// 修改学生信息
async function modifyStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('api/Db-update', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      alert('修改成功');
      closeModifyModal();
      fetchStudents();
    } else {
      alert('修改失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('修改失败，请稍后重试');
  }
}

// 搜索学生
async function searchStudent(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('api/Db-Search', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      updateTable(data.students);
      closeSearchModal();
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
}

// 搜索同班学生
async function searchClassStudents(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('api/Db-SearchClass', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      updateTable(data.students);
      closeSearchClassModal();
    } else {
      alert('搜索失败：' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('搜索失败，请稍后重试');
  }
}

// Modal 相关函数
function openSearchModal() {
  document.getElementById('searchStudentModal').style.display = 'block';
}

function openSearchClassModal() {
  document.getElementById('searchStudentClassModal').style.display = 'block';
}

function closeSearchModal() {
  document.getElementById('searchStudentModal').style.display = 'none';
}

function closeSearchClassModal() {
  document.getElementById('searchStudentClassModal').style.display = 'none';
}

function openAddModal() {
  document.getElementById('addStudentModal').style.display = 'block';
}

function closeAddModal() {
  document.getElementById('addStudentModal').style.display = 'none';
}

function openModifyModal(studentId, studentName, studentClass) {
  document.getElementById('modifyStudentId').value = studentId;
  document.getElementById('modifyStudentName').value = studentName;
  document.getElementById('modifyStudentClass').value = studentClass;
  document.getElementById('modifyStudentModal').style.display = 'block';
}

function closeModifyModal() {
  document.getElementById('modifyStudentModal').style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
  const modals = [
    document.getElementById('searchStudentModal'),
    document.getElementById('addStudentModal'),
    document.getElementById('modifyStudentModal'),
    document.getElementById('searchStudentClassModal')
  ];

  modals.forEach(modal => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}
