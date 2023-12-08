// list.js

function deleteUser(userId) {
  alert("삭제를 위해 비밀번호 입력 바람");
  var input = prompt();
  if (input == "1111") {
    fetch("/userDelete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.reload(); // 페이지 새로고침
        }
      })
      .catch((error) => console.error("Error:", error));
    window.location.reload(); // 페이지 새로고침
  }
}

function openEditModal(userId, name, studentId) {
  document.getElementById("editUserId").value = userId;
  document.getElementById("editName").value = name;
  document.getElementById("editStudentId").value = studentId;
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // 폼에서 데이터 가져오기
  const userId = document.getElementById("editUserId").value;
  const name = document.getElementById("editName").value;
  const studentId = document.getElementById("editStudentId").value;

  // AJAX 요청을 위한 설정
  const data = { userId, name, studentId };
  fetch("/userUpdate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("서버와 통신 중 문제가 발생했습니다.");
      }
    })
    .then((data) => {
      // 성공적으로 처리된 경우
      console.log("수정 성공:", data);
      closeEditModal(); // 모달창 닫기
      window.location.reload(); // 페이지 새로고침
    })
    .catch((error) => {
      console.error("수정 실패:", error);
      window.location.reload(); // 페이지 새로고침
    });
});
