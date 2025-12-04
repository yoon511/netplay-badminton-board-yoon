"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, X, Clock, RotateCcw } from "lucide-react";

// ---------- 타입 정의 ----------
type Player = {
  id: number;
  name: string;
  grade: string;
  gender: string;
  playCount: number;
};

type Court = {
  id: number;
  players: Player[];
  startTime: number | null;
};

export default function BadmintonManager({ isAdmin }: { isAdmin: boolean }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("D");
  const [newGender, setNewGender] = useState("male");

  // ---------- courts 초기값 (Vercel 오류 해결됨) ----------
  const [courts, setCourts] = useState<Court[]>([
    { id: 1, players: [], startTime: null },
    { id: 2, players: [], startTime: null },
    { id: 3, players: [], startTime: null },
  ]);


  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [waitingQueues, setWaitingQueues] = useState<number[][]>([[], [], []]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------- 대기열 자동 정리 ----------
  const compactWaitingQueues = (queues: number[][]) => {
    const newQueues = queues.filter((q) => q.length > 0);
    while (newQueues.length < 3) newQueues.push([]);
    return newQueues;
  };

  // ---------- 참가자 추가 ----------
  const addPlayer = () => {
    if (!newName.trim()) return;

    const newPlayer = {
      id: Date.now(),
      name: newName.trim(),
      grade: newGrade,
      gender: newGender,
      playCount: 0,
    };

    setPlayers([...players, newPlayer]);
    setNewName("");
  };

  // ---------- 참가자 삭제 ----------
  const removePlayer = (id: number) => {
    if (!isAdmin) return;

    setPlayers(players.filter((p) => p.id !== id));
    setSelectedPlayers(selectedPlayers.filter((x) => x !== id));
    setWaitingQueues(waitingQueues.map((q) => q.filter((x) => x !== id)));
  };

  // ---------- 플레이어 선택 ----------
  const togglePlayerSelection = (id: number) => {
    if (!isAdmin) return;

    if (selectedPlayers.includes(id)) {
      setSelectedPlayers(selectedPlayers.filter((x) => x !== id));
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, id]);
    }
  };

  // ---------- 선택된 4명을 대기열로 이동 ----------
  const moveToWaitingQueue = () => {
    if (!isAdmin) return;
    if (selectedPlayers.length !== 4) return alert("4명을 선택해야 합니다.");

    let targetIndex = waitingQueues.findIndex((q) => q.length === 0);
    if (targetIndex === -1) {
      alert("대기열이 모두 찼습니다!");
      return;
    }

    let newQueues = [...waitingQueues];
    newQueues[targetIndex] = selectedPlayers;

    newQueues = compactWaitingQueues(newQueues);

    setWaitingQueues(newQueues);
    setSelectedPlayers([]);
  };

  // ---------- 대기열 → 코트 ----------
  const assignToCourt = (courtId: number, queueIndex: number) => {
    if (!isAdmin) return;

    const queue = waitingQueues[queueIndex];
    if (queue.length !== 4) return;

    const assignedPlayers = players.filter((p) => queue.includes(p.id));

    setCourts(
      courts.map((court) =>
        court.id === courtId
          ? { ...court, players: assignedPlayers, startTime: Date.now() }
          : court
      )
    );

    setPlayers(
      players.map((p) =>
        queue.includes(p.id) ? { ...p, playCount: p.playCount + 1 } : p
      )
    );

    let newQueues = [...waitingQueues];
    newQueues[queueIndex] = [];
    newQueues = compactWaitingQueues(newQueues);

    setWaitingQueues(newQueues);
  };

  // ---------- 코트 비우기 ----------
  const clearCourt = (courtId: number) => {
    if (!isAdmin) return;

    setCourts(
      courts.map((court) =>
        court.id === courtId ? { ...court, players: [] as any[], startTime: null } : court
      )
    );
  };

  // ---------- 시간 계산 ----------
  const getElapsedTime = (startTime: number | null) => {
    if (!startTime) return "00:00";

    const sec = Math.floor((currentTime - startTime) / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;

    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ---------- 코트에 있는 사람들 ----------
  const playersInCourts = new Set(
    courts.flatMap((court) => court.players.map((p: any) => p.id))
  );

  // ---------- 초기화 ----------
  const resetAll = () => {
    if (!isAdmin) return;
    if (!confirm("모든 데이터를 초기화하시겠습니까?")) return;

    setPlayers([]);
    setSelectedPlayers([]);
    setWaitingQueues([[], [], []]);

    setCourts([
      { id: 1, players: [] as any[], startTime: null },
      { id: 2, players: [] as any[], startTime: null },
      { id: 3, players: [] as any[], startTime: null },
    ]);
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3 items-center">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold">넷플레이 게임판_윤정</h1>
          </div>

          {isAdmin && (
            <button
              onClick={resetAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex gap-2 items-center"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          )}
        </div>

        {/* 참가자 등록 */}
        <div className="bg-gray-100 p-4 rounded-xl mb-6">
          <h2 className="font-semibold text-lg mb-3">참가자 등록 (누구나 가능)</h2>

          <div className="flex flex-wrap gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="이름"
              className="border p-2 rounded-lg"
            />

            <select
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="A">A조</option>
              <option value="B">B조</option>
              <option value="C">C조</option>
              <option value="D">D조</option>
              <option value="E">E조</option>
            </select>

            <select
              value={newGender}
              onChange={(e) => setNewGender(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="male">남자</option>
              <option value="female">여자</option>
            </select>

            <button
              onClick={addPlayer}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex gap-2 items-center"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
          </div>
        </div>

        {/* 전체 참가자 */}
        <h2 className="font-semibold text-lg mb-3">
          전체 참가자 ({players.length}명)
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {players.map((p) => {
            const isWaiting = waitingQueues.some((q) => q.includes(p.id));
            const isSelected = selectedPlayers.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() =>
                  !isWaiting && isAdmin && togglePlayerSelection(p.id)
                }
                className={`p-4 rounded-xl border transition relative
                  ${
                    p.gender === "male"
                      ? "bg-blue-100 border-blue-300"
                      : "bg-pink-100 border-pink-300"
                  }
                  ${isSelected ? "ring-4 ring-yellow-400" : ""}
                  ${isWaiting ? "opacity-50" : ""}
                `}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(p.id);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                <div className="font-bold">{p.name}</div>
                <div className="text-sm">{p.grade}조</div>
                <div className="text-xs mt-1">참여: {p.playCount}회</div>

                {playersInCourts.has(p.id) && (
                  <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded z-20">
                    플레이 중
                  </div>
                )}

                {isWaiting && (
                  <div className="absolute top-1 left-1 bg-orange-500 bg-opacity-70 text-white text-xs px-2 py-0.5 rounded z-20">
                    대기 중
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 대기 넣기 */}
        {isAdmin && selectedPlayers.length === 4 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={moveToWaitingQueue}
              className="px-6 py-3 rounded-xl font-bold bg-orange-500 text-white"
            >
              대기 넣기
            </button>
          </div>
        )}

        {/* 대기/코트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 대기 */}
          <div>
            <h2 className="font-semibold text-lg mb-3">대기 현황</h2>

            {waitingQueues.map((q, i) => (
              <div
                key={i}
                className="bg-orange-100 border border-orange-300 rounded-xl p-4 mb-3"
              >
                <div className="flex justify-between">
                  <span className="font-bold">대기 {i + 1}</span>
                  <span>{q.length}/4명</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {q.map((id) => {
                    const p = players.find((x) => x.id === id);
                    if (!p) return null;

                    return (
                      <div
                        key={p.id}
                        className={`p-2 rounded text-sm ${
                          p.gender === "male"
                            ? "bg-blue-200 text-blue-900"
                            : "bg-pink-200 text-pink-900"
                        }`}
                      >
                        {p.name} ({p.grade})
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 코트 */}
          <div>
            <h2 className="font-semibold text-lg mb-3">코트 현황</h2>

            {courts.map((court) => (
              <div
                key={court.id}
                className="bg-green-100 border border-green-300 rounded-xl p-4 mb-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold">코트 {court.id}</h3>

                  {court.startTime && (
                    <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-bold">
                        {getElapsedTime(court.startTime)}
                      </span>
                    </div>
                  )}
                </div>

                {court.players.length === 0 ? (
                  <div>
                    <div className="text-center text-gray-500 mb-2">
                      빈 코트
                    </div>

                    <div className="flex gap-2">
                      {waitingQueues.map((q, i) => (
                        <button
                          key={i}
                          disabled={!isAdmin || q.length !== 4}
                          onClick={() => assignToCourt(court.id, i)}
                          className={`flex-1 py-2 rounded-xl ${
                            !isAdmin
                              ? "bg-gray-300 text-gray-500"
                              : q.length === 4
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-500"
                          }`}
                        >
                          대기 {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {court.players.map((p: any) => (
                        <div
                          key={p.id}
                          className={`p-2 rounded text-sm ${
                            p.gender === "male"
                              ? "bg-blue-200 text-blue-900"
                              : "bg-pink-200 text-pink-900"
                          }`}
                        >
                          {p.name} ({p.grade})
                        </div>
                      ))}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => clearCourt(court.id)}
                        className="w-full py-2 bg-red-500 text-white rounded-xl"
                      >
                        코트 비우기
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm mt-6 text-gray-500">
          관리자 모드: URL 끝에 <b>?admin=yoon511</b> 을 붙이세요.
        </p>
      </div>
    </div>
  );
}
