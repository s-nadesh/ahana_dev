<?php

namespace common\models;

use common\models\query\CoRoomQuery;
use cornernote\linkall\LinkAllBehavior;
use yii\db\ActiveQuery;
use Yii;

/**
 * This is the model class for table "co_room".
 *
 * @property integer $room_id
 * @property integer $tenant_id
 * @property integer $ward_id
 * @property string $bed_name
 * @property integer $maintain_id
 * @property string $occupied_status
 * @property string $notes
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoRoomMaintenance $maintain
 * @property CoTenant $tenant
 */
class CoRoom extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_room';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['ward_id', 'bed_name'], 'required'],
                [['tenant_id', 'ward_id', 'maintain_id', 'created_by', 'modified_by'], 'integer'],
                [['occupied_status', 'status', 'notes'], 'string'],
                [['created_at', 'modified_at', 'notes'], 'safe'],
                [['bed_name'], 'string', 'max' => 50],
                [['occupied_status'], 'validateNotes'],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'ward_id', 'bed_name', 'deleted_at'], 'message' => 'The combination of Ward Name has already been taken.']
        ];
    }

    public function validateNotes($attribute, $params) {
        if ($this->$attribute == '2' && empty($this->notes)) {
            $this->addError($attribute, 'Notes can not be empty');
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'room_id' => 'Room ID',
            'tenant_id' => 'Tenant ID',
            'ward_id' => 'Ward Name',
            'bed_name' => 'Room Name',
            'maintain_id' => 'Room Maintain Status',
            'occupied_status' => 'Occupied Status',
            'notes' => 'Notes',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    public function behaviors() {
        $extend = [
            LinkAllBehavior::className(),
        ];

        $behaviour = array_merge(parent::behaviors(), $extend);
        return $behaviour;
    }

    /**
     * @return ActiveQuery
     */
    public function getMaintain() {
        return $this->hasOne(CoRoomMaintenance::className(), ['maintain_id' => 'maintain_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getWard() {
        return $this->hasOne(CoWard::className(), ['ward_id' => 'ward_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoRoomQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'ward_detail' => function ($model) {
                return (isset($model->ward) ? $model->ward : '-');
            },
            'ward_name' => function ($model) {
                return (isset($model->ward) ? $model->ward->ward_name : '-');
            },
            'maintain_name' => function ($model) {
                return (isset($model->maintain) ? $model->maintain->maintain_name : '-');
            },
            'roomstatus' => function ($model) {
                return (isset($model->roomstatus) ? $model->roomstatus : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function getRoomTypesRooms() {
        return $this->hasMany(CoRoomTypesRooms::className(), ['room_id' => 'room_id']);
    }

    public function getRoomTypes() {
        return $this->hasMany(CoRoomType::className(), ['room_type_id' => 'room_type_id'])->via('roomTypesRooms');
    }

    public function getRoomstatus() {
        $sts = '';
        switch ($this->occupied_status) {
            case 0:
                $sts = 'Vacant';
                break;
            case 1:
                $sts = 'Occupied';
                break;
            case 2:
                $sts = 'Maintenance';
                break;
        }
        return $sts;
    }

    public static function getRoomList($tenant = null, $status = '1', $deleted = false, $occupied_status = null) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->occupiedStatus($occupied_status)->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->occupiedStatus($occupied_status)->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Room Added Successfully (#' . $this->bed_name . ' )';
        else
            $activity = 'Room Updated Successfully (#' . $this->bed_name . ' )';
        CoAuditLog::insertAuditLog(CoRoom::tableName(), $this->room_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
